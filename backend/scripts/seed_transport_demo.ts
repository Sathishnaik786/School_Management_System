import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Specify path to backend .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.SUPABASE_URL;
// Try to use Service Role Key if available, else Anon Key
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!url || !key) {
    console.error("Missing credentials. URL:", !!url, "Key:", !!key);
    process.exit(1);
}

const supabase = createClient(url, key);

const seed = async () => {
    console.log("🌱 Seeding Demo Transport Data...");
    console.log("Using Key length:", key.length, key === process.env.SUPABASE_SERVICE_ROLE_KEY ? "(Service Role)" : "(Anon)");

    // 1. Get Driver User
    const { data: users, error: uErr } = await supabase.from('users').select('id, school_id').eq('email', 'driver1@school.com');
    if (uErr) console.error("User Fetch Error:", uErr);
    if (!users || !users.length) {
        console.error("User 'driver1@school.com' not found. Please ensure this user exists.");
        return;
    }
    const driverUser = users[0];
    const schoolId = driverUser.school_id;
    console.log("Found Driver User:", driverUser.id, "School:", schoolId);

    // 2. Ensure Transport Driver
    let { data: driver } = await supabase.from('transport_drivers').select('*').eq('user_id', driverUser.id).single();
    if (!driver) {
        const { data: newDriver, error: dErr } = await supabase.from('transport_drivers').insert({
            user_id: driverUser.id,
            school_id: schoolId,
            license_number: 'DL-DEMO-1234',
            phone: '555-0101',
            status: 'ACTIVE'
        }).select().single();
        if (dErr) console.error("❌ Driver Insert Error:", dErr);
        driver = newDriver;
    }
    console.log("✅ Driver Ready:", driver?.id);

    if (!driver) return;

    // 3. Create Demo Vehicle
    let { data: vehicle } = await supabase.from('transport_vehicles').select('*').eq('vehicle_no', 'BUS-DEMO-01').single();
    if (!vehicle) {
        const { data: newVehicle, error: vErr } = await supabase.from('transport_vehicles').insert({
            school_id: schoolId,
            vehicle_no: 'BUS-DEMO-01',
            capacity: 30,
            status: 'ACTIVE'
        }).select().single();
        if (vErr) console.error("❌ Vehicle Insert Error:", vErr);
        vehicle = newVehicle;
    }
    console.log("✅ Vehicle Ready:", vehicle?.vehicle_no);

    // 4. Create Demo Route
    let { data: route } = await supabase.from('transport_routes').select('*').eq('name', 'Route A1 (Downtown)').single();
    if (!route) {
        const { data: newRoute, error: rErr } = await supabase.from('transport_routes').insert({
            school_id: schoolId,
            name: 'Route A1 (Downtown)',
            description: 'Demo Route for UI Testing'
        }).select().single();
        if (rErr) console.error("❌ Route Insert Error:", rErr);
        route = newRoute;
    }
    console.log("✅ Route Ready:", route?.name);

    if (!route || !vehicle) return;

    // 5. Create Stops
    const stopsData = [
        { name: 'Central School', latitude: 17.440080, longitude: 78.348915 },
        { name: 'City Center Mall', latitude: 17.425080, longitude: 78.340000 },
        { name: 'Jubilee Hills Checkpost', latitude: 17.435080, longitude: 78.400000 }
    ];

    const stops = [];
    for (const s of stopsData) {
        let { data: stop } = await supabase.from('transport_stops').select('*').eq('name', s.name).single();
        if (!stop) {
            const { data: newStop } = await supabase.from('transport_stops').insert({
                school_id: schoolId,
                ...s
            }).select().single();
            stop = newStop;
        }
        if (stop) stops.push(stop);
    }
    console.log(`✅ ${stops.length} Stops Created/Found`);

    // 6. Link Stops to Route
    // Delete existing to simplify order updates
    await supabase.from('transport_route_stops').delete().eq('route_id', route.id);

    for (let i = 0; i < stops.length; i++) {
        await supabase.from('transport_route_stops').insert({
            route_id: route.id,
            stop_id: stops[i].id,
            stop_order: i + 1,
            morning_time: `0${7 + i}:00:00`,
            evening_time: `0${3 + i}:00:00`
        });
    }
    console.log("✅ Stops Linked to Route");

    // 7. Assign Driver & Vehicle to Route
    await supabase.from('route_vehicles').delete().eq('driver_id', driver.id);
    await supabase.from('route_vehicles').delete().eq('vehicle_id', vehicle.id);

    const { error: assignErr } = await supabase.from('route_vehicles').insert({
        route_id: route.id,
        vehicle_id: vehicle.id,
        driver_id: driver.id
    });

    if (assignErr) console.error("❌ Assign Driver Error:", assignErr);
    else console.log("✅ Assigned Driver to Route");

    console.log("\n🚀 SEED COMPLETE. Driver Dashboard should now show 'Scheduled' trips.");
};

seed();
