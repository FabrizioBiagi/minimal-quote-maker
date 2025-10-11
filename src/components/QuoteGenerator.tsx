import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { QuoteCard } from "./QuoteCard";
import { Download, Upload, Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export const QuoteGenerator = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [quote, setQuote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const squareCardRef = useRef<HTMLDivElement>(null);
  const verticalCardRef = useRef<HTMLDivElement>(null);

  // Load persisted data from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("quote-generator-name");
    const savedUsername = localStorage.getItem("quote-generator-username");
    
    if (savedName) setName(savedName);
    if (savedUsername) setUsername(savedUsername);
  }, []);

  // Save name to localStorage
  useEffect(() => {
    if (name) {
      localStorage.setItem("quote-generator-name", name);
    }
  }, [name]);

  // Save username to localStorage
  useEffect(() => {
    if (username) {
      localStorage.setItem("quote-generator-username", username);
    }
  }, [username]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande. Máximo 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success("Imagen cargada correctamente");
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = async (aspectRatio: "square" | "vertical") => {
    setIsGenerating(true);
    
    try {
      const cardRef = aspectRatio === "square" ? squareCardRef : verticalCardRef;
      
      if (!cardRef.current) {
        toast.error("Error al generar la imagen");
        return;
      }

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 1,
        logging: false,
        width: 1080,
        height: aspectRatio === "square" ? 1080 : 1920,
      });

      const link = document.createElement("a");
      link.download = aspectRatio === "square" 
        ? "quote-card-cuadrado.png" 
        : "quote-card-tiktok.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Imagen descargada correctamente");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Error al generar la imagen");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {/* Hidden cards at full size for html2canvas capture */}
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <QuoteCard
          ref={squareCardRef}
          profileImage={profileImage}
          name={name}
          username={username}
          quote={quote}
          aspectRatio="square"
        />
        <QuoteCard
          ref={verticalCardRef}
          profileImage={profileImage}
          name={name}
          username={username}
          quote={quote}
          aspectRatio="vertical"
        />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-foreground">
            Generador de Citas Minimalista
          </h1>
          <p className="text-muted-foreground text-lg">
            Crea imágenes profesionales de citas para tus redes sociales
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="p-6 space-y-6 shadow-lg">
            <div>
              <Label htmlFor="profile-image" className="text-base font-semibold mb-3 block">
                Foto de Perfil
              </Label>
              <div className="flex items-center gap-4">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <label htmlFor="profile-image">
                  <Button variant="secondary" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Cargar Imagen
                    </span>
                  </Button>
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name" className="text-base font-semibold mb-3 block">
                Nombre
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="text-base"
              />
            </div>

            <div>
              <Label htmlFor="username" className="text-base font-semibold mb-3 block">
                Usuario
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario"
                  className="text-base pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quote" className="text-base font-semibold mb-3 block">
                Frase / Cita
              </Label>
              <Textarea
                id="quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Escribe tu frase inspiradora aquí..."
                className="min-h-[150px] text-base resize-none"
              />
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={() => downloadImage("square")}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar 1:1 (1080x1080)
              </Button>
              <Button
                onClick={() => downloadImage("vertical")}
                disabled={isGenerating}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar 9:16 (1080x1920)
              </Button>
            </div>
          </Card>

          {/* Preview */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Vista Previa (1:1)
              </h3>
              <Card className="overflow-hidden shadow-lg">
                <div className="bg-white p-8 flex items-center justify-center">
                  <div className="w-full max-w-[400px] aspect-square bg-white shadow-sm">
                    <div className="scale-[0.37] origin-top-left">
                      <QuoteCard
                        profileImage={profileImage}
                        name={name}
                        username={username}
                        quote={quote}
                        aspectRatio="square"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Vista Previa (9:16)
              </h3>
              <Card className="overflow-hidden shadow-lg">
                <div className="bg-white p-8 flex items-center justify-center">
                  <div className="w-full max-w-[225px] aspect-[9/16] bg-white shadow-sm">
                    <div className="scale-[0.208] origin-top-left">
                      <QuoteCard
                        profileImage={profileImage}
                        name={name}
                        username={username}
                        quote={quote}
                        aspectRatio="vertical"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
