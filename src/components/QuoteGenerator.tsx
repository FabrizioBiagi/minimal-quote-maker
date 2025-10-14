import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteCard } from "./QuoteCard";
import { Download, Upload, Image as ImageIcon, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import html2canvas from "html2canvas";
import { toast } from "sonner";

const generateRandomStats = () => ({
  comments: formatNumber(Math.floor(Math.random() * 500) + 10),
  retweets: formatNumber(Math.floor(Math.random() * 800) + 20),
  likes: formatNumber(Math.floor(Math.random() * 5000) + 100),
  views: formatNumber(Math.floor(Math.random() * 50000) + 1000),
});

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

export const QuoteGenerator = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [quote, setQuote] = useState("");
  const [bulkQuotes, setBulkQuotes] = useState<string[]>([""]);
  const [massiveText, setMassiveText] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState(generateRandomStats());

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
    setStats(generateRandomStats());
    
    try {
      const cardRef = aspectRatio === "square" ? squareCardRef : verticalCardRef;
      
      if (!cardRef.current) {
        toast.error("Error al generar la imagen");
        return;
      }

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: isDarkMode ? "#000000" : "#ffffff",
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

  const addBulkQuote = () => {
    setBulkQuotes([...bulkQuotes, ""]);
  };

  const updateBulkQuote = (index: number, value: string) => {
    const newQuotes = [...bulkQuotes];
    newQuotes[index] = value;
    setBulkQuotes(newQuotes);
  };

  const removeBulkQuote = (index: number) => {
    if (bulkQuotes.length > 1) {
      const newQuotes = bulkQuotes.filter((_, i) => i !== index);
      setBulkQuotes(newQuotes);
    }
  };

  const downloadBulkImages = async (aspectRatio: "square" | "vertical") => {
    const quotes = bulkQuotes.filter(q => q.trim() !== "");
    
    if (quotes.length === 0) {
      toast.error("Por favor ingresa al menos una frase");
      return;
    }

    setIsGenerating(true);
    
    try {
      for (let i = 0; i < quotes.length; i++) {
        const currentQuote = quotes[i].trim();
        const currentStats = generateRandomStats();
        
        // Create a temporary hidden div for this quote
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        document.body.appendChild(tempDiv);
        
        // Render the QuoteCard into the temp div
        const { createRoot } = await import("react-dom/client");
        const root = createRoot(tempDiv);
        
        await new Promise<void>((resolve) => {
          root.render(
            <QuoteCard
              profileImage={profileImage}
              name={name}
              username={username}
              quote={currentQuote}
              aspectRatio={aspectRatio}
              isBold={isBold}
              isItalic={isItalic}
              isDarkMode={isDarkMode}
              stats={currentStats}
            />
          );
          setTimeout(resolve, 100);
        });

        const canvas = await html2canvas(tempDiv.firstChild as HTMLElement, {
          backgroundColor: isDarkMode ? "#000000" : "#ffffff",
          scale: 1,
          logging: false,
          width: 1080,
          height: aspectRatio === "square" ? 1080 : 1920,
        });

        const link = document.createElement("a");
        const suffix = aspectRatio === "square" ? "cuadrado" : "tiktok";
        link.download = `quote-${i + 1}-${suffix}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        root.unmount();
        document.body.removeChild(tempDiv);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success(`${quotes.length} imágenes descargadas correctamente`);
    } catch (error) {
      console.error("Error generating bulk images:", error);
      toast.error("Error al generar las imágenes");
    } finally {
      setIsGenerating(false);
    }
  };

  const processMassiveText = (text: string): string[] => {
    // Split by ^" to separate different phrases
    const phrases = text.split('^"').map(phrase => phrase.trim()).filter(phrase => phrase !== "");
    
    // Replace *" with line breaks within each phrase
    return phrases.map(phrase => phrase.replace(/\*"/g, "\n"));
  };

  const downloadMassiveTextImages = async (aspectRatio: "square" | "vertical") => {
    const processedQuotes = processMassiveText(massiveText);
    
    if (processedQuotes.length === 0) {
      toast.error("Por favor ingresa al menos una frase");
      return;
    }

    setIsGenerating(true);
    
    try {
      for (let i = 0; i < processedQuotes.length; i++) {
        const currentQuote = processedQuotes[i].trim();
        const currentStats = generateRandomStats();
        
        // Create a temporary hidden div for this quote
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        document.body.appendChild(tempDiv);
        
        // Render the QuoteCard into the temp div
        const { createRoot } = await import("react-dom/client");
        const root = createRoot(tempDiv);
        
        await new Promise<void>((resolve) => {
          root.render(
            <QuoteCard
              profileImage={profileImage}
              name={name}
              username={username}
              quote={currentQuote}
              aspectRatio={aspectRatio}
              isBold={isBold}
              isItalic={isItalic}
              isDarkMode={isDarkMode}
              stats={currentStats}
            />
          );
          setTimeout(resolve, 100);
        });

        const canvas = await html2canvas(tempDiv.firstChild as HTMLElement, {
          backgroundColor: isDarkMode ? "#000000" : "#ffffff",
          scale: 1,
          logging: false,
          width: 1080,
          height: aspectRatio === "square" ? 1080 : 1920,
        });

        const link = document.createElement("a");
        const suffix = aspectRatio === "square" ? "cuadrado" : "tiktok";
        link.download = `quote-${i + 1}-${suffix}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        root.unmount();
        document.body.removeChild(tempDiv);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast.success(`${processedQuotes.length} imágenes descargadas correctamente`);
    } catch (error) {
      console.error("Error generating massive text images:", error);
      toast.error("Error al generar las imágenes");
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
          isBold={isBold}
          isItalic={isItalic}
          isDarkMode={isDarkMode}
          stats={stats}
        />
        <QuoteCard
          ref={verticalCardRef}
          profileImage={profileImage}
          name={name}
          username={username}
          quote={quote}
          aspectRatio="vertical"
          isBold={isBold}
          isItalic={isItalic}
          isDarkMode={isDarkMode}
          stats={stats}
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
          <Card className="p-6 shadow-lg">
            <Tabs defaultValue="individual" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="multiple">Múltiples Campos</TabsTrigger>
                <TabsTrigger value="texto-masivo">Texto Masivo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="individual" className="space-y-6">
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

            <div>
              <Label className="text-base font-semibold mb-3 block">
                Estilo de Texto
              </Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bold"
                    checked={isBold}
                    onCheckedChange={(checked) => setIsBold(checked as boolean)}
                  />
                  <label
                    htmlFor="bold"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Negrita
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="italic"
                    checked={isItalic}
                    onCheckedChange={(checked) => setIsItalic(checked as boolean)}
                  />
                  <label
                    htmlFor="italic"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Cursiva
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">
                Tema
              </Label>
              <div className="flex items-center space-x-3">
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
                <label
                  htmlFor="dark-mode"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  Modo Oscuro
                </label>
              </div>
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
              </TabsContent>

              <TabsContent value="multiple" className="space-y-6">
                <div>
                  <Label htmlFor="profile-image-bulk" className="text-base font-semibold mb-3 block">
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
                    <label htmlFor="profile-image-bulk">
                      <Button variant="secondary" className="cursor-pointer" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Cargar Imagen
                        </span>
                      </Button>
                    </label>
                    <input
                      id="profile-image-bulk"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name-bulk" className="text-base font-semibold mb-3 block">
                    Nombre
                  </Label>
                  <Input
                    id="name-bulk"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ingresa tu nombre"
                    className="text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="username-bulk" className="text-base font-semibold mb-3 block">
                    Usuario
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      @
                    </span>
                    <Input
                      id="username-bulk"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="usuario"
                      className="text-base pl-8"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">
                      Frases ({bulkQuotes.filter(q => q.trim() !== "").length})
                    </Label>
                    <Button
                      type="button"
                      onClick={addBulkQuote}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      + Agregar Frase
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {bulkQuotes.map((quote, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <Textarea
                          value={quote}
                          onChange={(e) => updateBulkQuote(index, e.target.value)}
                          placeholder={`Frase ${index + 1}...`}
                          className="min-h-[60px] text-base resize-none"
                        />
                        {bulkQuotes.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeBulkQuote(index)}
                            variant="ghost"
                            size="sm"
                            className="h-[60px] px-3 text-muted-foreground hover:text-destructive"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Estilo de Texto
                  </Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bold-bulk"
                        checked={isBold}
                        onCheckedChange={(checked) => setIsBold(checked as boolean)}
                      />
                      <label
                        htmlFor="bold-bulk"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Negrita
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="italic-bulk"
                        checked={isItalic}
                        onCheckedChange={(checked) => setIsItalic(checked as boolean)}
                      />
                      <label
                        htmlFor="italic-bulk"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Cursiva
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Tema
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="dark-mode-bulk"
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                    />
                    <label
                      htmlFor="dark-mode-bulk"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <Moon className="w-4 h-4" />
                      Modo Oscuro
                    </label>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={() => downloadBulkImages("square")}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Todas 1:1 (1080x1080)
                  </Button>
                  <Button
                    onClick={() => downloadBulkImages("vertical")}
                    disabled={isGenerating}
                    variant="secondary"
                    className="w-full"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Todas 9:16 (1080x1920)
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="texto-masivo" className="space-y-6">
                <div>
                  <Label htmlFor="profile-image-massive" className="text-base font-semibold mb-3 block">
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
                    <label htmlFor="profile-image-massive">
                      <Button variant="secondary" className="cursor-pointer" asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Cargar Imagen
                        </span>
                      </Button>
                    </label>
                    <input
                      id="profile-image-massive"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="name-massive" className="text-base font-semibold mb-3 block">
                    Nombre
                  </Label>
                  <Input
                    id="name-massive"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ingresa tu nombre"
                    className="text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="username-massive" className="text-base font-semibold mb-3 block">
                    Usuario
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      @
                    </span>
                    <Input
                      id="username-massive"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="usuario"
                      className="text-base pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="massive-text" className="text-base font-semibold mb-3 block">
                    Texto Masivo
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Usa <code className="bg-muted px-1 py-0.5 rounded">^"</code> para separar frases y <code className="bg-muted px-1 py-0.5 rounded">*"</code> para saltos de línea
                  </p>
                  <Textarea
                    id="massive-text"
                    value={massiveText}
                    onChange={(e) => setMassiveText(e.target.value)}
                    placeholder='Ejemplo: Primera frase aquí^"Segunda frase*"con salto de línea^"Tercera frase...'
                    className="min-h-[200px] text-base resize-none font-mono"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Estilo de Texto
                  </Label>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bold-massive"
                        checked={isBold}
                        onCheckedChange={(checked) => setIsBold(checked as boolean)}
                      />
                      <label
                        htmlFor="bold-massive"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Negrita
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="italic-massive"
                        checked={isItalic}
                        onCheckedChange={(checked) => setIsItalic(checked as boolean)}
                      />
                      <label
                        htmlFor="italic-massive"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Cursiva
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Tema
                  </Label>
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="dark-mode-massive"
                      checked={isDarkMode}
                      onCheckedChange={setIsDarkMode}
                    />
                    <label
                      htmlFor="dark-mode-massive"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <Moon className="w-4 h-4" />
                      Modo Oscuro
                    </label>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={() => downloadMassiveTextImages("square")}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Todas 1:1 (1080x1080)
                  </Button>
                  <Button
                    onClick={() => downloadMassiveTextImages("vertical")}
                    disabled={isGenerating}
                    variant="secondary"
                    className="w-full"
                    size="lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Todas 9:16 (1080x1920)
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
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
                        isBold={isBold}
                        isItalic={isItalic}
                        isDarkMode={isDarkMode}
                        stats={stats}
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
                        isBold={isBold}
                        isItalic={isItalic}
                        isDarkMode={isDarkMode}
                        stats={stats}
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
