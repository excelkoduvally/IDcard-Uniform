const url = "https://joyglzzquwiamqhpuibv.supabase.co/rest/v1/students?select=*";
const headers = {
  "apikey": "sb_publishable_lcKsiLYjUwJu2xRDcGkyOQ_xOsJWvV4",
  "Authorization": "Bearer sb_publishable_lcKsiLYjUwJu2xRDcGkyOQ_xOsJWvV4"
};

fetch(url, { headers })
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
