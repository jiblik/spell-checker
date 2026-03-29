const express = require("express");
const Anthropic = require("@anthropic-ai/sdk").default;
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const client = new Anthropic();

const SYSTEM_PROMPTS = {
  male: `אתה מתקן כתיב ודקדוק בעברית לשירות לקוחות.
תפקידך: לקבל טקסט ולהחזיר אותו מתוקן בלבד - בלי הסברים, בלי הערות.
כללים:
- תקן שגיאות כתיב ודקדוק
- הפנייה ללקוח צריכה להיות בלשון זכר (אתה, שלך, לך וכו')
- שמור על הסגנון והטון המקוריים
- אל תוסיף ואל תמחק תוכן
- החזר רק את הטקסט המתוקן`,

  female: `אתה מתקן כתיב ודקדוק בעברית לשירות לקוחות.
תפקידך: לקבל טקסט ולהחזיר אותו מתוקן בלבד - בלי הסברים, בלי הערות.
כללים:
- תקן שגיאות כתיב ודקדוק
- הפנייה ללקוח צריכה להיות בלשון נקבה (את, שלך, לך וכו')
- שמור על הסגנון והטון המקוריים
- אל תוסיף ואל תמחק תוכן
- החזר רק את הטקסט המתוקן`,

  neutral: `אתה מתקן כתיב ודקדוק בעברית לשירות לקוחות.
תפקידך: לקבל טקסט ולהחזיר אותו מתוקן בלבד - בלי הסברים, בלי הערות.
כללים:
- תקן שגיאות כתיב ודקדוק
- השתמש בפנייה ניטרלית ללא מגדר (למשל: "ניתן", "אפשר", "מוזמן/ת" וכו')
- שמור על הסגנון והטון המקוריים
- אל תוסיף ואל תמחק תוכן
- החזר רק את הטקסט המתוקן`,
};

app.post("/api/correct", async (req, res) => {
  const { text, gender } = req.body;

  if (!text || !gender) {
    return res.status(400).json({ error: "Missing text or gender" });
  }

  const systemPrompt = SYSTEM_PROMPTS[gender];
  if (!systemPrompt) {
    return res.status(400).json({ error: "Invalid gender option" });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: text }],
    });

    const corrected = message.content[0].text;
    res.json({ corrected });
  } catch (err) {
    console.error("API error:", err.message);
    res.status(500).json({ error: "Failed to correct text" });
  }
});

const PORT = process.env.PORT || 3851;
app.listen(PORT, () => {
  console.log(`Spell checker running at http://localhost:${PORT}`);
});
