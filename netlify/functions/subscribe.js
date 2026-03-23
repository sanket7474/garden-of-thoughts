const { Resend } = require("resend");

exports.handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    const resend = new Resend(process.env.RESEND_API_KEY);

    const response = await resend.contacts.create({
      email: email,
     audienceId: process.env.RESEND_AUDIENCE_ID,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};