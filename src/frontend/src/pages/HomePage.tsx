import { GuestCheckInStatus } from "@/backend.d";
import BanquetModal from "@/components/BanquetModal";
import BookingModal from "@/components/BookingModal";
import Header from "@/components/Header";
import TableReservationModal from "@/components/TableReservationModal";
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
import { useAllGuestCheckIns } from "@/hooks/useQueries";
import {
  Award,
  Building2,
  Car,
  ChevronDown,
  Coffee,
  Mail,
  MapPin,
  MonitorSpeaker,
  Phone,
  ShieldCheck,
  Star,
  Tv,
  Users,
  UtensilsCrossed,
  WashingMachine,
  Wifi,
  Wind,
  Zap,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { SiFacebook, SiInstagram, SiYoutube } from "react-icons/si";
import { toast } from "sonner";

// Rooms data
const rooms = [
  {
    id: "standard",
    name: "Standard Room",
    price: "₹1,599",
    image: "/assets/generated/room-deluxe.dim_800x600.jpg",
    amenities: [
      "Comfortable Bed",
      "Air Conditioning",
      "Free WiFi",
      "TV",
      "Attached Bath",
      "Room Service",
    ],
    desc: "Cozy and value-for-money rooms in our Side Building. Rooms 501-509 (no lift).",
    floors: "501-509 · Side Building",
  },
  {
    id: "single-executive",
    name: "Single Executive Room",
    price: "₹1,199",
    image: "/assets/generated/room-deluxe.dim_800x600.jpg",
    amenities: [
      "Single Bed",
      "Air Conditioning",
      "Free WiFi",
      "Flat Screen TV",
      "Work Desk",
      "24hr Service",
    ],
    desc: "Ideal for solo travellers. Compact yet fully-equipped. Rooms 201 & 214 on Floor 2.",
    floors: "Rooms 201, 214 · Floor 2",
  },
  {
    id: "executive",
    name: "Executive Room",
    price: "₹2,550",
    image: "/assets/generated/room-deluxe.dim_800x600.jpg",
    amenities: [
      "King Size Bed",
      "Air Conditioning",
      "Free WiFi",
      "Smart TV",
      "Mini Fridge",
      "24hr Room Service",
    ],
    desc: "Our most popular category. Available across floors 1, 2, and 3 (Rooms 101-102, 202-209, 401-412, 414).",
    floors: "22 rooms across Floors 1, 2, 3",
  },
  {
    id: "deluxe",
    name: "Deluxe Room",
    price: "₹3,250",
    image: "/assets/generated/room-deluxe.dim_800x600.jpg",
    amenities: [
      "Premium King Bed",
      "Air Conditioning",
      "Free WiFi",
      "Smart TV",
      "Mini Bar",
      "Bath Tub",
    ],
    desc: "Enhanced comfort with premium furnishings. Rooms 103, 105-107 (Fl.1), 210, 212 (Fl.2), 410-411 (Fl.3).",
    floors: "9 rooms across Floors 1, 2, 3",
  },
  {
    id: "amrapali",
    name: "Amrapali Suite",
    price: "₹4,750",
    image: "/assets/generated/room-suite.dim_800x600.jpg",
    amenities: [
      "King Suite",
      "Jacuzzi",
      "Free WiFi",
      "Home Theater",
      "Full Mini Bar",
      "Butler Service",
    ],
    desc: "Named after the legendary Amrapali. Lavish suites at Room 104 (Floor 1) & Room 416 (Floor 3).",
    floors: "Rooms 104, 416 · Floors 1 & 3",
  },
  {
    id: "rajgirih",
    name: "Rajgirih Suite",
    price: "₹6,500",
    image: "/assets/generated/room-suite.dim_800x600.jpg",
    amenities: [
      "Royal King Suite",
      "Jacuzzi",
      "Free WiFi",
      "Home Theater",
      "Full Mini Bar",
      "Dedicated Butler",
    ],
    desc: "The pinnacle of luxury at KDM Palace. Our finest suites: Room 211 (Floor 2) and Room 415 (Floor 3).",
    floors: "Rooms 211, 415 · Floors 2 & 3",
  },
];

const amenities = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: Car, label: "Free Parking" },
  { icon: Wind, label: "Air Conditioned" },
  { icon: UtensilsCrossed, label: "Restaurant" },
  { icon: Building2, label: "Banquet Hall" },
  { icon: Zap, label: "Power Backup" },
  { icon: ShieldCheck, label: "24/7 CCTV" },
  { icon: WashingMachine, label: "Laundry" },
  { icon: MonitorSpeaker, label: "Conference Room" },
  { icon: Coffee, label: "Room Service" },
];

const testimonials = [
  {
    name: "Rohit Sharma",
    location: "Patna, Bihar",
    rating: 5,
    text: "Absolutely stunning hotel! The Royal Suite exceeded all expectations. The staff was incredibly attentive and the restaurant food was divine. Will definitely return!",
  },
  {
    name: "Priya Singh",
    location: "Muzaffarpur, Bihar",
    rating: 5,
    text: "We hosted our wedding reception here and it was magical. The banquet hall was beautifully decorated and the catering was excellent. Highly recommend KDM Palace!",
  },
  {
    name: "Amit Gupta",
    location: "Delhi",
    rating: 4,
    text: "Best hotel in Begusarai by far. Clean rooms, excellent service, and the location is very convenient. The Deluxe Room was comfortable and well-furnished.",
  },
  {
    name: "Kavita Devi",
    location: "Bhagalpur, Bihar",
    rating: 5,
    text: "The fine dining experience at KDM Palace restaurant is unmatched in the region. The multi-cuisine menu has something for everyone. A truly royal experience!",
  },
];

const galleryImages = [
  {
    src: "/assets/generated/hotel-hero.dim_1600x900.jpg",
    alt: "Hotel Exterior",
    span: "col-span-2",
  },
  { src: "/assets/generated/room-suite.dim_800x600.jpg", alt: "Royal Suite" },
  { src: "/assets/generated/room-deluxe.dim_800x600.jpg", alt: "Deluxe Room" },
  {
    src: "/assets/generated/restaurant.dim_800x600.jpg",
    alt: "Restaurant",
    span: "col-span-2",
  },
  {
    src: "/assets/generated/banquet-hall.dim_800x600.jpg",
    alt: "Banquet Hall",
    span: "col-span-2",
  },
  {
    src: "/assets/generated/room-deluxe.dim_800x600.jpg",
    alt: "Room Interior",
  },
  {
    src: "/assets/generated/room-suite.dim_800x600.jpg",
    alt: "Suite Bathroom",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={
            n <= count ? "fill-gold text-gold" : "text-muted-foreground"
          }
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { actor } = useActor();
  const [bookingOpen, setBookingOpen] = useState(false);
  const { data: checkIns = [] } = useAllGuestCheckIns();
  const occupiedRoomSet = new Set<string>(
    checkIns
      .filter((g) => g.status === GuestCheckInStatus.checkedIn)
      .map((g) => g.roomNumber),
  );
  const reservedRoomSet = (() => {
    try {
      const raw = localStorage.getItem("kdm_booking_reservations");
      const arr: Array<{ roomNumber: string; status: string }> = raw
        ? JSON.parse(raw)
        : [];
      return new Set<string>(
        arr
          .filter(
            (r) =>
              r.roomNumber &&
              (r.status === "Confirmed" || r.status === "Tentative"),
          )
          .map((r) => r.roomNumber),
      );
    } catch {
      return new Set<string>();
    }
  })();
  const [banquetOpen, setBanquetOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [heroForm, setHeroForm] = useState({
    checkIn: "",
    checkOut: "",
    guests: "2",
    roomType: "Deluxe Room",
  });

  // Dynamic images from admin Image Manager
  const adminBannerImages: Array<{ url: string }> = (() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_banner_images") || "[]");
    } catch {
      return [];
    }
  })();
  const _adminRoomImages: Array<{
    id: string;
    url: string;
    name: string;
    caption: string;
  }> = (() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_room_images") || "[]");
    } catch {
      return [];
    }
  })();
  const _adminHallImages: Array<{
    id: string;
    url: string;
    name: string;
    caption: string;
  }> = (() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_hall_images") || "[]");
    } catch {
      return [];
    }
  })();
  const heroBg =
    adminBannerImages.length > 0
      ? adminBannerImages[0].url
      : "/assets/generated/hotel-hero.dim_1600x900.jpg";
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [contactLoading, setContactLoading] = useState(false);

  const openBookingFor = (room: string) => {
    setSelectedRoom(room);
    setBookingOpen(true);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedRoom(heroForm.roomType);
    setBookingOpen(true);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill all required fields.");
      return;
    }
    setContactLoading(true);
    try {
      await actor?.submitContact({
        ...contactForm,
        timestamp: BigInt(Date.now()),
      });
      toast.success("Message sent! We'll get back to you soon.");
      setContactForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "#f8fafc" }}
    >
      <Header onBookNow={() => setBookingOpen(true)} />

      {/* ═══ HERO ═══ */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${heroBg}')`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.6) 60%, rgba(15,23,42,0.85) 100%)",
          }}
        />
        <div className="relative z-10 text-center px-4 w-full max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs tracking-[0.5em] uppercase text-gold mb-4">
              Welcome To
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 leading-tight">
              HOTEL KDM PALACE
            </h1>
            <div className="gold-divider" />
            <p className="mt-6 text-base md:text-xl text-white/90 max-w-xl mx-auto leading-relaxed">
              Luxury &amp; Elegance in the Heart of Begusarai, Bihar
            </p>
          </motion.div>

          {/* Quick booking widget */}
          <motion.form
            onSubmit={handleHeroSearch}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-10 rounded-lg p-6 md:p-8 grid grid-cols-2 md:grid-cols-5 gap-3"
            style={{
              background: "rgba(255,255,255,0.97)",
              border: "1px solid oklch(0.73 0.115 74 / 0.35)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="col-span-1 space-y-1">
              <label
                htmlFor="hero-checkin"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Check In
              </label>
              <Input
                id="hero-checkin"
                type="date"
                value={heroForm.checkIn}
                onChange={(e) =>
                  setHeroForm((p) => ({ ...p, checkIn: e.target.value }))
                }
                data-ocid="hero.checkin.input"
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label
                htmlFor="hero-checkout"
                className="text-xs uppercase tracking-widest text-muted-foreground"
              >
                Check Out
              </label>
              <Input
                id="hero-checkout"
                type="date"
                value={heroForm.checkOut}
                onChange={(e) =>
                  setHeroForm((p) => ({ ...p, checkOut: e.target.value }))
                }
                data-ocid="hero.checkout.input"
              />
            </div>
            <div className="col-span-1 space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Guests
              </p>
              <Select
                value={heroForm.guests}
                onValueChange={(v) => setHeroForm((p) => ({ ...p, guests: v }))}
              >
                <SelectTrigger data-ocid="hero.guests.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5", "6"].map((n) => (
                    <SelectItem key={n} value={n}>
                      {n} {Number(n) === 1 ? "Guest" : "Guests"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1 space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Room Type
              </p>
              <Select
                value={heroForm.roomType}
                onValueChange={(v) =>
                  setHeroForm((p) => ({ ...p, roomType: v }))
                }
              >
                <SelectTrigger data-ocid="hero.room_type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard Room">
                    Standard (501-509)
                  </SelectItem>
                  <SelectItem value="Single Executive Room">
                    Single Executive
                  </SelectItem>
                  <SelectItem value="Executive Room">Executive</SelectItem>
                  <SelectItem value="Deluxe Room">Deluxe</SelectItem>
                  <SelectItem value="Amrapali Suite">Amrapali Suite</SelectItem>
                  <SelectItem value="Rajgirih Suite">Rajgirih Suite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 md:col-span-1 flex items-end">
              <button
                type="submit"
                className="btn-gold w-full text-sm"
                data-ocid="hero.search.button"
              >
                Search Rooms
              </button>
            </div>
          </motion.form>
        </div>

        {/* Scroll arrow */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          onClick={() =>
            document
              .querySelector("#about")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <ChevronDown className="text-gold" size={32} />
        </motion.div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section id="about" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">
              Discover
            </p>
            <h2 className="section-title">
              Welcome to <span className="gold-text">KDM Palace</span>
            </h2>
            <div className="gold-divider" />
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-3xl mx-auto">
              Nestled in the vibrant heart of Begusarai, Bihar, Hotel KDM Palace
              stands as the region's premier luxury destination. Since our
              establishment, we have been dedicated to delivering an exceptional
              experience that blends traditional Indian hospitality with modern
              elegance. From opulent rooms and world-class dining to grand
              banquet facilities, every detail at KDM Palace is crafted to
              perfection.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: Award, stat: "Est. 2010", label: "Years of Excellence" },
              { icon: Building2, stat: "50+", label: "Luxurious Rooms" },
              { icon: Users, stat: "5000+", label: "Happy Guests" },
            ].map((item, i) => (
              <motion.div
                key={item.stat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="text-center p-8 rounded-lg"
                style={{
                  background: "#ffffff",
                  border: "1px solid oklch(0.73 0.115 74 / 0.2)",
                }}
              >
                <item.icon className="w-10 h-10 mx-auto mb-4 text-gold" />
                <div className="font-serif text-3xl font-bold gold-text">
                  {item.stat}
                </div>
                <div className="text-sm text-muted-foreground mt-1 tracking-wide uppercase">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ROOMS ═══ */}
      <section
        id="rooms"
        className="py-24 px-4"
        style={{ background: "#f1f5f9" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">
              Accommodations
            </p>
            <h2 className="section-title">
              Rooms &amp; <span className="gold-text">Suites</span>
            </h2>
            <div className="gold-divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rooms.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="hotel-card"
                data-ocid={`rooms.item.${i + 1}`}
              >
                <div className="relative overflow-hidden h-56">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div
                    className="absolute top-3 right-3 px-3 py-1 rounded text-xs font-bold"
                    style={{
                      background: "oklch(0.73 0.115 74)",
                      color: "#ffffff",
                    }}
                  >
                    {room.price}
                    <span className="font-medium">/night</span>
                  </div>
                  {(() => {
                    const roomNos = room.floors.match(/\d{3}/g) ?? [];
                    const anyOccupied = roomNos.some((n) =>
                      occupiedRoomSet.has(n),
                    );
                    const anyReserved =
                      !anyOccupied &&
                      roomNos.some((n) => reservedRoomSet.has(n));
                    if (anyOccupied)
                      return (
                        <div
                          className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold"
                          style={{ background: "#ef4444", color: "#fff" }}
                        >
                          Rooms Occupied
                        </div>
                      );
                    if (anyReserved)
                      return (
                        <div
                          className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold"
                          style={{ background: "#f59e0b", color: "#fff" }}
                        >
                          Reserved
                        </div>
                      );
                    return (
                      <div
                        className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold"
                        style={{ background: "#22c55e", color: "#fff" }}
                      >
                        Available
                      </div>
                    );
                  })()}
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold gold-text mb-2">
                    {room.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {room.desc}
                  </p>
                  <ul className="space-y-1.5 mb-6">
                    {room.amenities.map((a) => (
                      <li
                        key={a}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <span className="w-1 h-1 rounded-full bg-gold inline-block" />
                        {a}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="btn-gold w-full text-sm"
                    onClick={() => openBookingFor(room.name)}
                    data-ocid={`rooms.book.button.${i + 1}`}
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ RESTAURANT ═══ */}
      <section id="restaurant" className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/restaurant.dim_800x600.jpg')",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(241,245,249,0.92)" }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">
              Culinary Excellence
            </p>
            <h2 className="section-title">
              Fine Dining <span className="gold-text">Experience</span>
            </h2>
            <div className="gold-divider" />
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Indulge your palate at KDM Palace's signature restaurant. Our
              master chefs craft extraordinary dishes from the finest
              ingredients, offering a journey through the world's great cuisines
              in an atmosphere of refined elegance.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              {["Indian Cuisine", "Chinese Cuisine", "Continental"].map(
                (cuisine) => (
                  <div
                    key={cuisine}
                    className="p-4 rounded text-center"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "1px solid oklch(0.73 0.115 74 / 0.3)",
                    }}
                  >
                    <p className="text-sm font-medium gold-text">{cuisine}</p>
                  </div>
                ),
              )}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                className="btn-gold px-8"
                onClick={() => setTableOpen(true)}
                data-ocid="restaurant.reserve_table.button"
              >
                Reserve a Table
              </button>
              <button
                type="button"
                className="btn-outline-gold px-8"
                data-ocid="restaurant.view_menu.button"
              >
                View Menu
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ BANQUET ═══ */}
      <section id="banquet" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div
                className="rounded-lg overflow-hidden h-96"
                style={{ border: "2px solid oklch(0.73 0.115 74 / 0.3)" }}
              >
                <img
                  src="/assets/generated/banquet-hall.dim_800x600.jpg"
                  alt="Banquet Hall"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">
                Grand Celebrations
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                The Grand <span className="gold-text">Banquet Hall</span>
              </h2>
              <div
                className="w-16 h-0.5 mb-6"
                style={{ background: "oklch(0.73 0.115 74)" }}
              />
              <p className="text-muted-foreground leading-relaxed mb-6">
                Transform your special occasions into extraordinary memories.
                Our grand banquet hall, with a capacity of up to 500 guests, is
                the perfect venue for weddings, corporate conferences, social
                gatherings, and milestone celebrations.
              </p>

              <ul className="space-y-2.5 mb-8">
                {[
                  "Up to 500 guests capacity",
                  "State-of-the-art audio/visual system",
                  "Customizable décor & floral arrangements",
                  "Dedicated event planning team",
                  "Multi-cuisine catering services",
                  "Ample parking for guests",
                ].map((feat) => (
                  <li
                    key={feat}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: "oklch(0.73 0.115 74)" }}
                    />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="btn-gold px-8"
                onClick={() => setBanquetOpen(true)}
                data-ocid="banquet.enquire.button"
              >
                Enquire Now
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ AMENITIES ═══ */}
      <section className="py-24 px-4" style={{ background: "#f1f5f9" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">
              At Your Service
            </p>
            <h2 className="section-title">
              Hotel <span className="gold-text">Amenities</span>
            </h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {amenities.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="flex flex-col items-center text-center p-5 rounded-lg transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "#ffffff",
                  border: "1px solid oklch(0.73 0.115 74 / 0.15)",
                }}
              >
                <item.icon className="w-7 h-7 text-gold mb-3" />
                <span className="text-xs text-muted-foreground font-medium">
                  {item.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ GALLERY ═══ */}
      <section id="gallery" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">
              Visual Journey
            </p>
            <h2 className="section-title">
              Our <span className="gold-text">Gallery</span>
            </h2>
            <div className="gold-divider" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {galleryImages.map((img, i) => (
              <motion.div
                key={`${img.alt}-${i}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`overflow-hidden rounded-lg cursor-pointer group ${
                  img.span ? "col-span-2" : ""
                }`}
                style={{ border: "1px solid oklch(0.73 0.115 74 / 0.2)" }}
                onClick={() => setLightboxImg(img.src)}
                data-ocid={`gallery.item.${i + 1}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setLightboxImg(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setLightboxImg(null);
          }}
          data-ocid="gallery.lightbox.modal"
        >
          <img
            src={lightboxImg}
            alt="Gallery"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
          <button
            type="button"
            className="absolute top-4 right-6 text-4xl text-gold hover:text-foreground"
            onClick={() => setLightboxImg(null)}
            data-ocid="gallery.lightbox.close_button"
          >
            ×
          </button>
        </div>
      )}

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-24 px-4" style={{ background: "#f1f5f9" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">
              Guest Reviews
            </p>
            <h2 className="section-title">
              What Our <span className="gold-text">Guests Say</span>
            </h2>
            <div className="gold-divider" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="p-6 rounded-lg"
                style={{
                  background: "#ffffff",
                  border: "1px solid oklch(0.73 0.115 74 / 0.2)",
                }}
                data-ocid={`testimonials.item.${i + 1}`}
              >
                <StarRating count={t.rating} />
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed italic">
                  "{t.text}"
                </p>
                <div
                  className="mt-4 pt-4"
                  style={{ borderTop: "1px solid oklch(0.73 0.115 74 / 0.2)" }}
                >
                  <p className="text-sm font-medium gold-text">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contact" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">
              Get In Touch
            </p>
            <h2 className="section-title">
              Contact <span className="gold-text">Us</span>
            </h2>
            <div className="gold-divider" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-xl font-bold gold-text mb-6">
                  Our Location
                </h3>
                <div className="space-y-5">
                  {[
                    {
                      icon: MapPin,
                      label: "Address",
                      value: "Near Main Road, Begusarai, Bihar - 851101",
                    },
                    { icon: Phone, label: "Phone", value: "+91 98765 43210" },
                    {
                      icon: Mail,
                      label: "Email",
                      value: "info@hotelkdmpalace.com",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center shrink-0"
                        style={{
                          background: "#ffffff",
                          border: "1px solid oklch(0.73 0.115 74 / 0.3)",
                        }}
                      >
                        <item.icon className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-0.5">
                          {item.label}
                        </p>
                        <p className="text-sm text-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <div
                className="h-64 rounded-lg flex items-center justify-center"
                style={{
                  background: "#ffffff",
                  border: "1px solid oklch(0.73 0.115 74 / 0.2)",
                }}
              >
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-gold mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Hotel KDM Palace
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Begusarai, Bihar
                  </p>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div
              className="p-8 rounded-lg"
              style={{
                background: "#ffffff",
                border: "1px solid oklch(0.73 0.115 74 / 0.2)",
              }}
            >
              <h3 className="font-serif text-xl font-bold gold-text mb-6">
                Send Us a Message
              </h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Name *
                    </Label>
                    <Input
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Your name"
                      required
                      data-ocid="contact.name.input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Phone
                    </Label>
                    <Input
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+91 XXXXX XXXXX"
                      data-ocid="contact.phone.input"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Email *
                    </Label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="email@example.com"
                      required
                      data-ocid="contact.email.input"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Subject
                    </Label>
                    <Input
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm((p) => ({
                          ...p,
                          subject: e.target.value,
                        }))
                      }
                      placeholder="How can we help?"
                      data-ocid="contact.subject.input"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Message *
                    </Label>
                    <Textarea
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm((p) => ({
                          ...p,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Write your message here..."
                      rows={4}
                      required
                      data-ocid="contact.message.textarea"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-gold w-full flex items-center justify-center gap-2"
                  disabled={contactLoading}
                  data-ocid="contact.submit.button"
                >
                  {contactLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer
        style={{
          background: "oklch(0.10 0.038 260)",
          borderTop: "1px solid oklch(0.73 0.115 74 / 0.25)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <h3 className="font-serif text-2xl font-bold gold-text mb-2">
                HOTEL KDM PALACE
              </h3>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Begusarai, Bihar
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Luxury & Elegance in the Heart of Begusarai. Your home away from
                home, crafted with care and attention to every detail.
              </p>
              <div className="flex gap-3 mt-6">
                {[
                  { Icon: SiFacebook, href: "#" },
                  { Icon: SiInstagram, href: "#" },
                  { Icon: SiYoutube, href: "#" },
                ].map(({ Icon, href }) => (
                  <a
                    key={href + Icon.name}
                    href={href}
                    className="w-9 h-9 rounded flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{
                      background: "#ffffff",
                      border: "1px solid oklch(0.73 0.115 74 / 0.3)",
                      color: "oklch(0.73 0.115 74)",
                    }}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest gold-text mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {[
                  "Home",
                  "Rooms",
                  "Restaurant",
                  "Banquet",
                  "Gallery",
                  "Contact",
                ].map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-sm text-muted-foreground hover:text-gold transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest gold-text mb-4">
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Near Main Road, Begusarai, Bihar - 851101
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-gold" />
                  <span className="text-sm text-muted-foreground">
                    +91 98765 43210
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} className="text-gold" />
                  <span className="text-sm text-muted-foreground">
                    info@hotelkdmpalace.com
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground"
            style={{ borderTop: "1px solid oklch(0.73 0.115 74 / 0.15)" }}
          >
            <span>
              © {new Date().getFullYear()} Hotel KDM Palace. All rights
              reserved.
            </span>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        defaultRoomType={selectedRoom}
      />
      <BanquetModal open={banquetOpen} onOpenChange={setBanquetOpen} />
      <TableReservationModal open={tableOpen} onOpenChange={setTableOpen} />
    </div>
  );
}
