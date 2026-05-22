import nodemailer from 'nodemailer'

// Em desenvolvimento, o Ethereal cria automaticamente uma caixa de entrada
// de teste. O link para visualizar o e-mail é exibido no console.
// Em produção, troque por um transporter SMTP real (Resend, SendGrid, etc.)

let transporter: nodemailer.Transporter | null = null

async function getTransporter() {
  if (transporter) return transporter

  if (process.env.SMTP_HOST) {
    // Configuração de produção via variáveis de ambiente
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  } else {
    // Desenvolvimento: cria conta Ethereal automaticamente
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
    console.log('📧 Usando Ethereal para e-mails de desenvolvimento')
  }

  return transporter
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
) {
  const transport = await getTransporter()
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`

  const info = await transport.sendMail({
    from: `"Financy" <noreply@financy.app>`,
    to,
    subject: 'Recuperação de senha - Financy',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <h2 style="color: #1F6F43; margin-bottom: 8px;">Recuperação de senha</h2>
        <p style="color: #4b5563;">Olá, <strong>${name}</strong>!</p>
        <p style="color: #4b5563;">Recebemos uma solicitação para redefinir a senha da sua conta Financy. Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background-color: #1F6F43; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Redefinir senha
          </a>
        </div>
        <p style="color: #6b7280; font-size: 13px;">
          Este link expira em <strong>1 hora</strong>. Se você não solicitou a recuperação, pode ignorar este e-mail com segurança.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          Ou copie e cole este link no seu navegador:<br />
          <span style="color: #1F6F43;">${resetUrl}</span>
        </p>
      </div>
    `,
  })

  // Em desenvolvimento, loga o link de preview do Ethereal no console
  const previewUrl = nodemailer.getTestMessageUrl(info)
  if (previewUrl) {
    console.log(`\n📬 E-mail de recuperação enviado!`)
    console.log(`👤 Para: ${to}`)
    console.log(`🔗 Visualize aqui: ${previewUrl}\n`)
  }
}
