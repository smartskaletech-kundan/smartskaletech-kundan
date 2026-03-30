import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BanquetModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function BanquetModal({
  open,
  onOpenChange,
}: BanquetModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "wedding",
    eventDate: "",
    guestCount: "100",
    message: "",
  });
  const { actor } = useActor();
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.eventDate) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await actor?.submitBanquet({
        name: form.name,
        email: form.email,
        phone: form.phone,
        eventType: form.eventType,
        eventDate: form.eventDate,
        guestCount: BigInt(form.guestCount),
        message: form.message,
        timestamp: BigInt(Date.now()),
      });
      toast.success(
        "Banquet inquiry submitted! Our team will contact you soon.",
      );
      onOpenChange(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        eventType: "wedding",
        eventDate: "",
        guestCount: "100",
        message: "",
      });
    } catch {
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background: "oklch(0.18 0.055 260)",
          borderColor: "oklch(0.73 0.115 74 / 0.3)",
        }}
        data-ocid="banquet.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl gold-text">
            Banquet Enquiry
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Let us make your event truly unforgettable
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Full Name *
              </Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your name"
                required
                data-ocid="banquet.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Email
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@example.com"
                data-ocid="banquet.email.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Phone *
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
                data-ocid="banquet.phone.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Event Type
              </Label>
              <Select
                value={form.eventType}
                onValueChange={(v) => set("eventType", v)}
              >
                <SelectTrigger data-ocid="banquet.event_type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="social">Social Gathering</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Event Date *
              </Label>
              <Input
                type="date"
                value={form.eventDate}
                onChange={(e) => set("eventDate", e.target.value)}
                required
                data-ocid="banquet.event_date.input"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Expected Guests
              </Label>
              <Select
                value={form.guestCount}
                onValueChange={(v) => set("guestCount", v)}
              >
                <SelectTrigger data-ocid="banquet.guest_count.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">Up to 50</SelectItem>
                  <SelectItem value="100">50–100</SelectItem>
                  <SelectItem value="200">100–200</SelectItem>
                  <SelectItem value="300">200–300</SelectItem>
                  <SelectItem value="500">300–500</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                Additional Details
              </Label>
              <Textarea
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Tell us more about your event..."
                rows={3}
                data-ocid="banquet.message.textarea"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="btn-outline-gold flex-1"
              onClick={() => onOpenChange(false)}
              data-ocid="banquet.cancel.button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 flex items-center justify-center gap-2"
              disabled={loading}
              data-ocid="banquet.submit.button"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                "Send Enquiry"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
