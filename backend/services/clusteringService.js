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
    console.log('🔄 Starting BUYER-BASED clustering process...');
    console.log('📋 Clustering based on BUYER DELIVERY locations');
    console.log('📋 Checking clustering criteria:');
    console.log('   - requestStatus: "accepted"');
    console.log('   - assignedTruckId: null');
    console.log('   - pickupCoordinates: exists');
    console.log('   - deliveryCoordinates: exists');

    // Debug: Check all orders
    const allOrders = await Order.find({});
    console.log(`📊 Total orders in database: ${allOrders.length}`);
    
    if (allOrders.length > 0) {
      console.log('📋 Sample order statuses:');
      allOrders.slice(0, 3).forEach(o => {
        console.log(`   Order ${o.orderId}:`);
        console.log(`     - requestStatus: ${o.requestStatus}`);
        console.log(`     - assignedTruckId: ${o.assignedTruckId}`);
        console.log(`     - pickupCoordinates: ${o.pickupCoordinates ? 'YES' : 'NO'}`);
        console.log(`     - deliveryCoordinates: ${o.deliveryCoordinates ? 'YES' : 'NO'}`);
      });
    }

    // Fetch all accepted but unassigned orders
    const orders = await Order.find({
      requestStatus: 'accepted',
      assignedTruckId: null,
      pickupCoordinates: { $exists: true },
      deliveryCoordinates: { $exists: true },
    }).populate('farmerId buyerId cropId');

    if (orders.length === 0) {
      console.log('⚠️ No orders match clustering criteria');
      return { success: true, message: 'No orders to cluster', clustersCreated: 0 };
    }

    console.log(`📦 Found ${orders.length} orders to cluster`);

    // 🔥 BUYER-BASED CLUSTERING: Use DELIVERY coordinates (buyer locations)
    const points = orders.map(order => ({
      orderId: order._id,
      lat: order.deliveryCoordinates.latitude,  // Changed from pickupCoordinates
      lon: order.deliveryCoordinates.longitude, // Changed from pickupCoordinates
      quantity: order.quantity,
      order: order,
    }));

    console.log('🎯 Clustering based on BUYER delivery locations (not farmer pickup locations)');

    // Run DBSCAN (8km radius, min 1 point)
    const eps = 8; // 8 km
    const minPoints = 1; // Allow single orders
    const clusterIndices = dbscan(points, eps, minPoints);

    console.log(`🎯 DBSCAN created ${clusterIndices.length} initial clusters based on buyer locations`);

    let clustersCreated = 0;

    // Process each cluster
    for (const clusterIdx of clusterIndices) {
      const clusterOrders = clusterIdx.map(idx => points[idx].order);
      const totalWeight = clusterOrders.reduce((sum, o) => sum + o.quantity, 0);

      console.log(`📊 Processing cluster with ${clusterOrders.length} orders (${clusterOrders.length} buyers), total weight: ${totalWeight}kg`);

      // Split by capacity if needed (2000kg limit)
      const MAX_CAPACITY = 2000;
      const bins = splitByCapacity(clusterOrders, MAX_CAPACITY);

      console.log(`📦 Split into ${bins.length} bins based on capacity`);

      // Assign truck to each bin
      for (const bin of bins) {
        const binWeight = bin.reduce((sum, o) => sum + o.quantity, 0);
        
        // 🔥 Calculate center based on BUYER locations (delivery coordinates)
        const centerCoords = {
          latitude: bin.reduce((sum, o) => sum + o.deliveryCoordinates.latitude, 0) / bin.length,
          longitude: bin.reduce((sum, o) => sum + o.deliveryCoordinates.longitude, 0) / bin.length
        };

        console.log(`📍 Cluster center (buyer area): Lat ${centerCoords.latitude}, Lon ${centerCoords.longitude}`);

        // Find nearest available truck to buyer cluster center
        const truck = await findNearestTruck(centerCoords, binWeight);

        if (!truck) {
          console.log(`⚠️ No available truck found for bin with ${binWeight}kg`);
          continue;
        }

        console.log(`🚛 Assigned truck ${truck.truckNumber} (capacity: ${truck.capacity}kg) for ${binWeight}kg to ${bin.length} buyers`);

        // Prepare pickups (from farmers)
        const pickups = bin.map((order, idx) => ({
          orderId: order._id,
          farmerId: order.farmerId._id,
          coordinates: order.pickupCoordinates,
          address: order.pickupAddress,
          quantity: order.quantity,
          sequence: idx,
        }));

        // Prepare deliveries (to buyers) - THIS IS THE MAIN ROUTE
        const deliveries = bin.map((order, idx) => ({
          orderId: order._id,
          buyerId: order.buyerId._id,
          coordinates: order.deliveryCoordinates,
          address: order.deliveryAddress,
          quantity: order.quantity,
          sequence: idx,
        }));

        // Optimize delivery route (buyer locations)
        const optimizedDeliveries = [];
        let remaining = [...deliveries];
        let current = truck.coordinates || centerCoords;
        
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
          optimizedDeliveries.push({ ...nearest, sequence: optimizedDeliveries.length });
          current = nearest.coordinates;
        }

        console.log(`🗺️ Optimized delivery route for ${optimizedDeliveries.length} buyers`);

        // Calculate total distance for the route
        let totalDistance = 0;
        let currentPos = truck.coordinates || centerCoords;
        
        // Distance from truck to first pickup
        if (pickups.length > 0) {
          totalDistance += calculateDistance(
            currentPos.latitude,
            currentPos.longitude,
            pickups[0].coordinates.latitude,
            pickups[0].coordinates.longitude
          );
          currentPos = pickups[0].coordinates;
        }
        
        // Distance between pickups (if multiple farmers)
        for (let i = 1; i < pickups.length; i++) {
          totalDistance += calculateDistance(
            pickups[i-1].coordinates.latitude,
            pickups[i-1].coordinates.longitude,
            pickups[i].coordinates.latitude,
            pickups[i].coordinates.longitude
          );
        }
        
        // Distance from last pickup to first delivery
        if (pickups.length > 0 && optimizedDeliveries.length > 0) {
          totalDistance += calculateDistance(
            pickups[pickups.length - 1].coordinates.latitude,
            pickups[pickups.length - 1].coordinates.longitude,
            optimizedDeliveries[0].coordinates.latitude,
            optimizedDeliveries[0].coordinates.longitude
          );
        }
        
        // Distance between deliveries (buyer to buyer)
        for (let i = 1; i < optimizedDeliveries.length; i++) {
          totalDistance += calculateDistance(
            optimizedDeliveries[i-1].coordinates.latitude,
            optimizedDeliveries[i-1].coordinates.longitude,
            optimizedDeliveries[i].coordinates.latitude,
            optimizedDeliveries[i].coordinates.longitude
          );
        }
        
        // Estimate time (assuming 40 km/h average speed)
        const estimatedTime = Math.round((totalDistance / 40) * 60); // in minutes
        
        console.log(`📏 Total route distance: ${totalDistance.toFixed(2)} km`);
        console.log(`⏱️ Estimated time: ${estimatedTime} minutes`);

        // Calculate earning (₹5 per kg)
        const earning = binWeight * 5;

        // Create cluster
        const cluster = await Cluster.create({
          assignedTruckId: truck._id,
          orders: bin.map(o => o._id),
          pickups: pickups,
          deliveries: optimizedDeliveries,
          totalWeight: binWeight,
          earning: earning,
          status: 'Assigned',
          centerCoordinates: centerCoords,
          totalDistance: Math.round(totalDistance * 100) / 100, // Round to 2 decimals
          estimatedTime: estimatedTime,
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
        console.log(`   - ${pickups.length} pickup(s) from farmer(s)`);
        console.log(`   - ${optimizedDeliveries.length} delivery(ies) to buyer(s)`);
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
