import { Resend } from "resend";

const resend = new Resend("re_gZUooGfm_PUVEKhpvT4nTkTwWhMgXrkao");

const data = await resend.audiences.list();

console.log(data);
console.log(JSON.stringify(data, null, 2));