import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailsTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {

    const receipient = [{email}];

    try{
        const response = await mailtrapClient.send({
            from : sender,
            to: receipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email verification"
        });

        console.log("Email sent successfully");

    }catch(e){
        console.error("error sending verification email", e);
        throw new Error('Failed to send verification email', e.message);
    }
}


export const sendWelcomeEmail = async (email, name) => {
    const receipient = [{email}];
    try{

        const response = await mailtrapClient.send ({
            from : sender,
            to: receipient,
            template_uuid: "b9c70a2a-cebd-4ed4-953d-c941b8d7dced",
            template_variables: {
                "company_info_name": "Gaafow Company",
                "name": "Dev Gafow"
              }
        });

        console.log("Welcome email sent successfully", response);

    }catch(e){
        console.error("error sending welcome email", e);
        throw new Error('Failed to send welcome email', e.message);
    }
};

// send forgot passwords

export const sendResetPasswordEmail = async (email, resetURL) => {
    const receipient = [{email}];

    try{

        const response = await mailtrapClient.send({
            from : sender,
            to: receipient,
            subject: "Reset Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password reset"
        })

    }catch(e){
        console.error("error sending reset password email", e);
        throw new Error('Failed to send reset password email', e.message);
    }
}

// reset successful password email
export const sendResetSuccessEmail = async (email) => {

    const recipient = [{email}];
    try{
        const response = await mailtrapClient.send({
            from : sender,
            to: recipient,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        });

        console.log("Reset password success email sent successfully", response);

    }catch(e){
        console.error("error sending reset password success email", e);
        throw new Error('Failed to send reset password success email', e.message);
    }
}
