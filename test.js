const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://joyglzzquwiamqhpuibv.supabase.co', 'sb_publishable_lcKsiLYjUwJu2xRDcGkyOQ_xOsJWvV4');

async function test() {
    const res = await supabase.from('schools').insert({ id: '00000000-0000-0000-0000-000000000000', school_name: 'test' });
    console.log(res);
}
test();
