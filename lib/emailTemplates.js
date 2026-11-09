const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function verificationEmail({ name, link, code }) {
  const first = String(name || "there").split(" ")[0];
  const subject = "Verify your email for InterviewIQ";

  const text = `Hi ${first},

Welcome to InterviewIQ! Your verification code is:

${code}

Enter it in the app (it works for 10 minutes). Or just open this link:

${link}

The link works for 24 hours. If you didn't create an account, you can ignore this email.

— InterviewIQ`;

  const html = `<!doctype html>
<html><body style="margin:0;background:#f4f4f8;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1b1e2b">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
    <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px">
      <tr><td>
        <p style="margin:0 0 20px;font-size:18px;font-weight:bold">InterviewIQ</p>
        <h1 style="margin:0 0 12px;font-size:22px">Confirm your email</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6">Hi ${esc(first)}, welcome! Enter this code in the app to verify your email and unlock posting, commenting and sharing resources.</p>
        <p style="margin:0 0 8px;font-size:34px;font-weight:bold;letter-spacing:10px;font-family:Consolas,Menlo,monospace;color:#1b1e2b">${esc(code)}</p>
        <p style="margin:0 0 24px;font-size:12px;color:#5c6178">The code works for 10 minutes.</p>
        <p style="margin:0 0 12px;font-size:14px;color:#5c6178">Or just tap the button:</p>
        <p style="margin:0 0 24px"><a href="${esc(link)}" style="display:inline-block;background:#5b5fef;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:bold;font-size:15px">Verify my email</a></p>
        <p style="margin:0 0 8px;font-size:13px;color:#5c6178">Or paste this link into your browser:</p>
        <p style="margin:0 0 24px;font-size:12px;word-break:break-all;color:#5c6178">${esc(link)}</p>
        <p style="margin:0;font-size:12px;color:#5c6178">The link works for 24 hours. If you didn't create an account, you can safely ignore this email.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  return { subject, text, html };
}
