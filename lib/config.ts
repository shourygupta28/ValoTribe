export const POLICY_VERSION='2026-10-03';
export function operator(){return {name:process.env.OPERATOR_NAME?.trim()||'',email:process.env.SUPPORT_EMAIL?.trim()||''}}
export function emailReady(){return !!(process.env.RESEND_API_KEY&&process.env.EMAIL_FROM&&process.env.APP_ORIGIN)}
export function signupReady(){const o=operator();return process.env.PUBLIC_SIGNUP_ENABLED==='true'&&!!o.name&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email)&&emailReady()}
