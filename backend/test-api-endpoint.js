
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testApi() {
    try {
        console.log("1. Authenticate (Get Token)...");
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
            email: 'admin@school.com',
            password: 'password123'
        });

        if (error) {
            console.error("Auth failed:", error.message);
            // Try to get session another way or skip if no user
            return;
        }

        const token = session.access_token;
        console.log("Token obtained.");

        const api = axios.create({
            baseURL: 'http://127.0.0.1:3000/api',
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("2. Get Classes...");
        const clsRes = await api.get('/academic/classes');
        const cls = clsRes.data[0];
        if (!cls) { console.error("No classes"); return; }
        console.log(`- Class: ${cls.name} (${cls.id})`);

        console.log("3. Get Sections...");
        const secRes = await api.get('/academic/sections', { params: { classId: cls.id } });
        const sections = secRes.data;
        console.log(`- Sections: ${sections.length}`);

        if (sections.length === 0) return;
        const section = sections[0];

        console.log(`4. Get Students for Section ${section.id}...`);
        const stuRes = await api.get('/students', {
            params: {
                sectionId: section.id,
                limit: 10
            }
        });

        console.log("Response Type:", typeof stuRes.data);
        console.log("Response Keys:", Object.keys(stuRes.data));

        if (stuRes.data.data) {
            console.log(`- Students Data Length: ${stuRes.data.data.length}`);
            if (stuRes.data.data.length > 0) {
                console.log("- Sample:", stuRes.data.data[0].full_name);
            }
        } else {
            console.log("- No 'data' property in response body.");
            console.log("- Full Body:", JSON.stringify(stuRes.data, null, 2));
        }

    } catch (e) {
        console.error("API Error:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data);
        }
    }
}

testApi();
