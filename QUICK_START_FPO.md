# Quick Start - FPO Storage Setup

## Run This Command to Add FPO Locations

```bash
cd backend
npm run seed:fpos
```

## What This Does

✅ Adds 15 FPO storage locations across India:
- 6 in Madhya Pradesh
- 7 in Andhra Pradesh  
- 2 in Odisha

✅ Each FPO includes:
- GPS coordinates
- Storage type (Cold/Dry/Both)
- Capacity and availability
- Contact information
- Rating

## After Seeding

1. **Test the Add Crop Page:**
   - Login as a farmer
   - Click "List New Crop"
   - Check "Need FPO Storage?"
   - Allow GPS permission
   - See nearby FPOs sorted by distance!

2. **FPO Dropdown Shows:**
   ```
   Krishi Srijan FPO - Dhar, Madhya Pradesh (12.5 km away) - Dry Storage - 3500 kg available - ⭐ 4.5
   ```

## Without GPS

If GPS is denied or unavailable:
- Shows all 15 FPOs
- Sorted by rating
- No distance shown

## That's It!

The system is now ready with real FPO locations. Farmers can select the nearest storage facility when listing their crops.
