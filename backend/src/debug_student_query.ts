
import { supabase } from './config/supabase';

async function testQuery() {
    console.log("Testing Student Query...");

    const schoolId = 'd898516d-31eb-47eb-b816-72489ae21d5a'; // Example school ID or I can fetch one

    try {
        const { data, error } = await supabase
            .from('students')
            .select('*, parents:student_parents(user:parent_user_id(full_name, email, phone_number, address)), sections:student_sections(section:section_id(name, class:class_id(name)))', { count: 'exact' })
            .limit(1);

        if (error) {
            console.error("Query Error:", error);
        } else {
            console.log("Query Success:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Execution Error:", err);
    }
}

testQuery();
