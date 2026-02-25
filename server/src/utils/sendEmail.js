import { Resend } from 'resend';

// Initialize Resend with the API key
// We use a getter or instantiate lazily so we can read from process.env after loaded
let resend;

export const sendEmail = async ({ to, subject, html }) => {
    if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }

    try {
        const data = await resend.emails.send({
            // The Resend free tier only allows sending from onboarding@resend.dev
            from: 'NeighborNode <onboarding@resend.dev>',
            to,
            subject,
            html,
        });

        console.log("Email sent successfully:", data);
        return data;
    } catch (error) {
        console.error('Error sending email via Resend:', error);
        throw new Error('Email service failed');
    }
};
