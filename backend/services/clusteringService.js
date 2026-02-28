const Order = require('../models/Order');
const Truck = require('../models/Truck');
const Cluster = require('../models/Cluster');

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// DBSCAN Clustering Algorithm
function dbscan(points, eps, minPoints) {
  const clusters = [];
  const visited = new Set();
  const noise = [];

  function regionQuery(pointIdx) {
    const neighbors = [];
    for (let i = 0; i < points.length; i++) {
      if (i === pointIdx) continue;
      const dist = calculateDistance(
        points[pointIdx].lat,
        points[pointIdx].lon,
        points[i].lat,
        points[i].lon
      );
      if (dist <= eps) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  function expandCluster(pointIdx, neighbors, cluster) {
    cluster.push(pointIdx);
    visited.add(pointIdx);

    let i = 0;
    while (i < neighbors.length) {
      const neighborIdx = neighbors[i];
      
      if (!visited.has(neighborIdx)) {
        visited.add(neighborIdx);
        const neighborNeighbors = regionQuery(neighborIdx);
        
        if (neighborNeighbors.length >= minPoints) {
          neighbors = neighbors.concat(neighborNeighbors);
        }
      }

      // Add to cluster if not already in any cluster
      let inCluster = false;
      for (const c of clusters) {
        if (c.includes(neighborIdx)) {
          inCluster = true;
          break;
        }
      }
      if (!inCluster && !cluster.includes(neighborIdx)) {
        cluster.push(neighborIdx);
      }

      i++;
    }
  }

  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) continue;

    visited.add(i);
    const neighbors = regionQuery(i);

    if (neighbors.length < minPoints) {
      noise.push(i);
    } else {
      const cluster = [];
      expandCluster(i, neighbors, cluster);
      clusters.push(cluster);
    }
  }

  // Add noise points as individual clusters
  noise.forEach(idx => {
    clusters.push([idx]);
  });

  return clusters;
}

// First Fit Decreasing - Bin Packing for capacity validation
function splitByCapacity(orders, maxCapacity) {
  // Sort orders by quantity (descending)
  const sorted = [...orders].sort((a, b) => b.quantity - a.quantity);
  const bins = [];

  sorted.forEach(order => {
    let placed = false;
    
    // Try to fit in existing bin
    for (const bin of bins) {
      const binWeight = bin.reduce((sum, o) => sum + o.quantity, 0);
      if (binWeight + order.quantity <= maxCapacity) {
        bin.push(order);
        placed = true;
        break;
      }
    }

    // Create new bin if doesn't fit
    if (!placed) {
      bins.push([order]);
    }
  });

  return bins;
}

// Calculate cluster center (centroid)
function calculateCentroid(orders) {
  const avgLat = orders.reduce((sum, o) => sum + o.pickupCoordinates.latitude, 0) / orders.length;
  const avgLon = orders.reduce((sum, o) => sum + o.pickupCoordinates.longitude, 0) / orders.length;
  return { latitude: avgLat, longitude: avgLon };
}

// Find nearest available truck
async function findNearestTruck(centerCoordinates, requiredCapacity) {
  const availableTrucks = await Truck.find({
    status: 'Available',
    capacity: { $gte: requiredCapacity },
  });

  if (availableTrucks.length === 0) return null;

  let nearestTruck = null;
  let minDistance = Infinity;

  availableTrucks.forEach(truck => {
    if (truck.coordinates && truck.coordinates.latitude && truck.coordinates.longitude) {
      const dist = calculateDistance(
        centerCoordinates.latitude,
        centerCoordinates.longitude,
        truck.coordinates.latitude,
        truck.coordinates.longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestTruck = truck;
      }
    }
  });

  return nearestTruck;
}

// Nearest Neighbor Route Optimization
function optimizeRoute(pickups, deliveries, startCoordinates) {
  const pickupRoute = [];
  const deliveryRoute = [];
  
  // Optimize pickup sequence
  let remaining = [...pickups];
  let current = startCoordinates;
  
  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;
    
    remaining.forEach((pickup, idx) => {
      const dist = calculateDistance(
        current.latitude,
        current.longitude,
        pickup.coordinates.latitude,
        pickup.coordinates.longitude
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = idx;
      }
    });
    
    const nearest = remaining.splice(nearestIdx, 1)[0];
    pickupRoute.push(nearest);
    current = nearest.coordinates;
  }

  // Optimize delivery sequence
  remaining = [...deliveries];
  
  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;
    
    remaining.forEach((delivery, idx) => {
      const dist = calculateDistance(
        current.latitude,
        current.longitude,
        delivery.coordinates.latitude,
        delivery.coordinates.longitude
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = idx;
      }
    });
    
    const nearest = remaining.splice(nearestIdx, 1)[0];
    deliveryRoute.push(nearest);
    current = nearest.coordinates;
  }

  return { pickupRoute, deliveryRoute };
}

// Main clustering function
async function runClustering() {
  try {
    console.log('🔄 Starting clustering process...');

    // Fetch all accepted but unassigned orders
    const orders = await Order.find({
      requestStatus: 'accepted',
      assignedTruckId: null,
      pickupCoordinates: { $exists: true },
      deliveryCoordinates: { $exists: true },
    }).populate('farmerId buyerId cropId');

    if (orders.length === 0) {
      console.log('✅ No orders to cluster');
      return { success: true, message: 'No orders to cluster', clustersCreated: 0 };
    }

    console.log(`📦 Found ${orders.length} orders to cluster`);

    // Prepare points for DBSCAN
    const points = orders.map(order => ({
      orderId: order._id,
      lat: order.pickupCoordinates.latitude,
      lon: order.pickupCoordinates.longitude,
      quantity: order.quantity,
      order: order,
    }));

    // Run DBSCAN (8km radius, min 2 points)
    const eps = 8; // 8 km
    const minPoints = 1; // Allow single orders
    const clusterIndices = dbscan(points, eps, minPoints);

    console.log(`🎯 DBSCAN created ${clusterIndices.length} initial clusters`);

    let clustersCreated = 0;

    // Process each cluster
    for (const clusterIdx of clusterIndices) {
      const clusterOrders = clusterIdx.map(idx => points[idx].order);
      const totalWeight = clusterOrders.reduce((sum, o) => sum + o.quantity, 0);

      console.log(`📊 Processing cluster with ${clusterOrders.length} orders, total weight: ${totalWeight}kg`);

      // Split by capacity if needed (2000kg limit)
      const MAX_CAPACITY = 2000;
      const bins = splitByCapacity(clusterOrders, MAX_CAPACITY);

      console.log(`📦 Split into ${bins.length} bins based on capacity`);

      // Assign truck to each bin
      for (const bin of bins) {
        const binWeight = bin.reduce((sum, o) => sum + o.quantity, 0);
        const centerCoords = calculateCentroid(bin);

        // Find nearest available truck
        const truck = await findNearestTruck(centerCoords, binWeight);

        if (!truck) {
          console.log(`⚠️ No available truck found for bin with ${binWeight}kg`);
          continue;
        }

        console.log(`🚛 Assigned truck ${truck.truckNumber} (capacity: ${truck.capacity}kg) for ${binWeight}kg`);

        // Prepare pickups and deliveries
        const pickups = bin.map((order, idx) => ({
          orderId: order._id,
          farmerId: order.farmerId._id,
          coordinates: order.pickupCoordinates,
          address: order.pickupAddress,
          quantity: order.quantity,
          sequence: idx,
        }));

        const deliveries = bin.map((order, idx) => ({
          orderId: order._id,
          buyerId: order.buyerId._id,
          coordinates: order.deliveryCoordinates,
          address: order.deliveryAddress,
          quantity: order.quantity,
          sequence: idx,
        }));

        // Optimize route
        const { pickupRoute, deliveryRoute } = optimizeRoute(
          pickups,
          deliveries,
          truck.coordinates || centerCoords
        );

        // Calculate earning (₹5 per kg)
        const earning = binWeight * 5;

        // Create cluster
        const cluster = await Cluster.create({
          assignedTruckId: truck._id,
          orders: bin.map(o => o._id),
          pickups: pickupRoute.map((p, idx) => ({ ...p, sequence: idx })),
          deliveries: deliveryRoute.map((d, idx) => ({ ...d, sequence: idx })),
          totalWeight: binWeight,
          earning: earning,
          status: 'Assigned',
          centerCoordinates: centerCoords,
        });

        // Update truck
        truck.status = 'Assigned';
        truck.currentLoad = binWeight;
        truck.activeClusterId = cluster._id;
        await truck.save();

        // Update orders
        for (const order of bin) {
          order.assignedTruckId = truck._id;
          order.clusterId = cluster._id;
          order.requestStatus = 'truck_assigned';
          await order.save();
        }

        clustersCreated++;
        console.log(`✅ Cluster created with ID: ${cluster._id}`);
      }
    }

    console.log(`🎉 Clustering complete! Created ${clustersCreated} clusters`);

    return {
      success: true,
      message: `Successfully created ${clustersCreated} clusters`,
      clustersCreated,
    };

  } catch (error) {
    console.error('❌ Clustering error:', error);
    return {
      success: false,
      message: error.message,
      clustersCreated: 0,
    };
  }
}

module.exports = {
  runClustering,
  calculateDistance,
};
