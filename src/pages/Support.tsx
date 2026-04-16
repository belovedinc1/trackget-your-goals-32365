import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Headphones, Loader2, MailCheck, MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzdpkov";

function submitWithFormspreeVerification(fields: Record<string, string | undefined>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = FORMSPREE_ENDPOINT;
  form.target = "_blank";
  form.style.display = "none";

  Object.entries(fields).forEach(([key, value]) => {
    if (!value) return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

export default function Support() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [topic, setTopic] = useState("app-support");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      email,
      topic,
      message,
      name: profile?.full_name || "Trackget user",
      user_id: user?.id,
      source: "Trackget Android app",
      _subject: `Trackget support: ${topic}`,
    };

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const errorMessage = errorBody?.error || "Formspree could not accept the message.";

        if (response.status === 403 && /AJAX|reCAPTCHA|custom key/i.test(errorMessage)) {
          submitWithFormspreeVerification(payload);
          setSent(true);
          setMessage("");
          toast.info("Complete the Formspree verification tab to finish sending.");
          return;
        }

        throw new Error(errorMessage);
      }

      setSent(true);
      setMessage("");
      toast.success("Support request sent");
    } catch (error) {
      console.error("[Support Form Error]", error);
      toast.error("Could not send support request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mobile-page">
      <section className="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative">
          <Badge className="mb-3 rounded-full bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
            Support desk
          </Badge>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">We are here to help.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Send issues, feature requests, data import problems, or account questions directly from the app.
          </p>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="app-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-black">
              <MessageCircle className="h-5 w-5 text-primary" />
              Contact Support
            </CardTitle>
            <CardDescription>Replies will go to the email address you enter below.</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="rounded-3xl border border-secondary/20 bg-secondary/10 p-6 text-center">
                <MailCheck className="mx-auto h-12 w-12 text-secondary" />
                <h2 className="mt-3 text-xl font-black">Message sent</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thanks for reaching out. We received your support request and will respond by email.
                </p>
                <Button className="mt-5 rounded-2xl" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="support-email">Email</Label>
                  <Input
                    id="support-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>What do you need help with?</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="app-support">App support</SelectItem>
                      <SelectItem value="bank-import">Bank statement import</SelectItem>
                      <SelectItem value="sms-parser">SMS parser</SelectItem>
                      <SelectItem value="account-billing">Account or billing</SelectItem>
                      <SelectItem value="feature-request">Feature request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-message">Message</Label>
                  <Textarea
                    id="support-message"
                    name="message"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Tell us what happened, what screen you were on, and what you expected."
                    rows={7}
                    required
                  />
                </div>

                <Button type="submit" className="h-12 w-full rounded-2xl" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send support request"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="app-card">
            <CardContent className="p-5">
              <Headphones className="h-8 w-8 text-primary" />
              <h2 className="mt-3 font-black">What to include</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Mention the page, the file/message you tried, and whether you are using the Android APK or browser.
              </p>
            </CardContent>
          </Card>
          <Card className="app-card">
            <CardContent className="p-5">
              <ShieldCheck className="h-8 w-8 text-secondary" />
              <h2 className="mt-3 font-black">Privacy note</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Avoid sending passwords, OTPs, full card numbers, or full bank account numbers in support messages.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
