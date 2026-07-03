export default function handler(req, res) {
    res.status(200).json({
      headers: {
        authorization: req.headers.authorization || null,
      },
      cookies: req.cookies || {},
      cookieHeader: req.headers.cookie || null,
    });
  }