import NextErrorComponent from "next/error";

function CustomError({ statusCode }) {
  return <NextErrorComponent statusCode={statusCode} />;
}

CustomError.getInitialProps = async (contextData) => {
  // Captura erro no Sentry
  
  // Fallback: log no Supabase se Sentry não estiver configurado
  const { err, asPath, req, res } = contextData;
  if (err) {
    await logErrorFallback({
      tipo: "page_error",
      mensagem: err.message,
      stack: err.stack,
      url: asPath,
      statusCode: res?.statusCode,
      userAgent: req?.headers?.["user-agent"],
      ip: req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim(),
    });
  }

  return NextErrorComponent.getInitialProps(contextData);
};

export default CustomError;

/**
 * Fallback: log de erros no Supabase quando Sentry não está disponível
 */
async function logErrorFallback({ tipo, mensagem, stack, url, statusCode, userAgent, ip }) {
  try {
    // Só loga se não temos SENTRY_DSN
    if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return;
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabase.from("erros").insert({
      tipo,
      mensagem: mensagem?.substring(0, 1000),
      stack: stack?.substring(0, 4000),
      url: url?.substring(0, 500),
      status_code: statusCode,
      user_agent: userAgent?.substring(0, 500),
      ip: ip?.substring(0, 45),
      ambiente: process.env.NODE_ENV,
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[ErrorFallback] Falha ao logar erro:", e.message);
  }
}
