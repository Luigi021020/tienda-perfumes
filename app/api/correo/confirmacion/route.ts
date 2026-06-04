// API para enviar correo de confirmacion al cliente
// Se llama después de crear el pedido exitosamente

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { pedido, customer, whatsapp } = await req.json();

    // Construir lista de productos para el correo
    const productosHtml = pedido.items
      .map(
        (item: { product: { name: string; brand: string }; quantity: number; price: number }) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #333;">${item.product.name} - ${item.product.brand}</td>
            <td style="padding: 8px; border-bottom: 1px solid #333; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #333; text-align: right;">$${(item.price * item.quantity).toLocaleString("es-MX")}</td>
          </tr>`
      )
      .join("");

    // Enlace de WhatsApp para retomar la conversacion
    const mensajeWA = encodeURIComponent(
      `Hola, soy ${customer.name}. Quiero retomar mi pedido *${pedido.orderNumber}* por $${pedido.total.toLocaleString("es-MX")}`
    );
    const linkWhatsApp = `https://wa.me/${whatsapp}?text=${mensajeWA}`;

    await resend.emails.send({
      from: "R&B Perfumes <onboarding@resend.dev>",
      to: customer.email,
      subject: `Pedido ${pedido.orderNumber} recibido - R&B Perfumes`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 30px;">

          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #EAB308; letter-spacing: 8px; font-size: 24px;">R&B</h1>
            <p style="color: #666; letter-spacing: 4px; font-size: 12px;">PERFUMES</p>
            <div style="width: 40px; height: 2px; background: #EAB308; margin: 10px auto;"></div>
          </div>

          <h2 style="color: #fff; margin-bottom: 5px;">Hola, ${customer.name}</h2>
          <p style="color: #999; margin-bottom: 20px;">Tu pedido fue recibido exitosamente.</p>

          <div style="background: #111; border: 1px solid #333; padding: 20px; margin-bottom: 20px;">
            <p style="color: #EAB308; font-size: 18px; font-weight: bold; margin: 0;">
              Pedido ${pedido.orderNumber}
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 1px solid #EAB308;">
                <th style="padding: 8px; text-align: left; color: #999; font-size: 12px;">PRODUCTO</th>
                <th style="padding: 8px; text-align: center; color: #999; font-size: 12px;">CANT</th>
                <th style="padding: 8px; text-align: right; color: #999; font-size: 12px;">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>${productosHtml}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px; font-weight: bold; color: #999;">TOTAL</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #EAB308; font-size: 18px;">
                  $${pedido.total.toLocaleString("es-MX")}
                </td>
              </tr>
            </tfoot>
          </table>

          <div style="background: #111; border: 1px solid #25D366; padding: 20px; text-align: center; margin-bottom: 20px;">
            <p style="color: #fff; margin-bottom: 15px;">
              Para completar tu compra, contacta a tu asesor por WhatsApp:
            </p>
            <a href="${linkWhatsApp}"
              style="background: #25D366; color: #fff; padding: 12px 30px; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 2px;">
              COMPLETAR COMPRA POR WHATSAPP
            </a>
          </div>

          <p style="color: #666; font-size: 12px; text-align: center; font-style: italic;">
            Cada esencia cuenta una historia, y tu ahora eres parte de la nuestra.
          </p>

        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    // No fallar el pedido si el correo falla
    return NextResponse.json({ ok: false });
  }
}