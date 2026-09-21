import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, UploadCloud, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const createAuctionSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  basePrice: z.number().min(1, 'El precio base debe ser mayor a 0'),
  minIncrement: z.number().min(1, 'El incremento debe ser mayor a 0'),
  startDate: z.string().min(1, 'Selecciona la fecha de inicio'),
  endDate: z.string().min(1, 'Selecciona la fecha de fin'),
});

type CreateAuctionFormValues = z.infer<typeof createAuctionSchema>;

export const CreateAuction: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para la imagen simulada
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAuctionFormValues>({
    resolver: zodResolver(createAuctionSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
    },
  });

  // --- Handlers de Imagen ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleSetFile(file);
    }
  };

  const handleSetFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSetFile(e.dataTransfer.files[0]);
    }
  };

  // --- Submit ---
  const onSubmit = async (data: CreateAuctionFormValues) => {
    if (!selectedImage) {
      alert("Por favor selecciona una imagen para el producto.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Obtener usuario del localStorage
      const userStr = localStorage.getItem('user');
      let userId = 1; // Default
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id || 1;
      }

      // 2. Construir payload
      const payload = {
        userId: userId,
        title: data.title,
        description: data.description,
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000", // TODO: Implementar subida real de imagen
        categoryIds: [parseInt(data.categoryId)],
        basePrice: data.basePrice,
        minimumIncrement: data.minIncrement,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };

      // 3. Enviar al backend
      const response = await fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        alert(`Error al crear la subasta: ${errorData?.message || response.statusText}`);
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      
      // Redirigir al catálogo luego de un momento
      setTimeout(() => navigate('/catalog'), 2000);
    } catch (error) {
      console.error(error);
      alert("Error de red al intentar crear la subasta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0B12] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-500 mb-5">
          <UploadCloud size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">¡Subasta Publicada!</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          Tu producto ha sido publicado con éxito y ya está disponible en el catálogo de subastas.
        </p>
        <p className="text-[#2F8CFF] text-sm animate-pulse">Redirigiendo al catálogo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B12] text-white flex flex-col">
      {/* Header simple */}
      <header className="sticky top-0 z-40 w-full bg-[#111827]/90 backdrop-blur-md border-b border-[#1F2937]">
        <div className="max-w-4xl mx-auto px-4 h-18 flex items-center justify-between">
          <Link to="/catalog" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Volver al catálogo</span>
          </Link>
          <span className="text-sm font-semibold tracking-wide text-white">Publicar Subasta</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 sm:p-8">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Detalles del Producto</h1>
            <p className="text-sm text-slate-400">Completa la información para iniciar la subasta de tu artículo.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Sección: Información Básica */}
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Título de la Subasta"
                placeholder="Ej. iPhone 15 Pro Max - 256GB"
                {...register('title')}
                error={errors.title?.message}
              />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Descripción
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Describe el estado del artículo, características, defectos (si los tiene)..."
                  className="w-full bg-[#0B0B12] border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2F8CFF] focus:ring-1 focus:ring-[#2F8CFF] transition-all min-h-[120px] resize-y"
                />
                {errors.description && (
                  <span className="text-xs text-red-500 mt-1">{errors.description.message}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Categoría
                </label>
                <select
                  {...register('categoryId')}
                  className="w-full bg-[#0B0B12] border border-[#1F2937] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2F8CFF] transition-all"
                >
                  <option value="">Selecciona una categoría...</option>
                  <option value="1">Electrónica</option>
                  <option value="2">Arte</option>
                  <option value="3">Vehículos</option>
                  <option value="4">Coleccionables</option>
                </select>
                {errors.categoryId && (
                  <span className="text-xs text-red-500 mt-1">{errors.categoryId.message}</span>
                )}
              </div>
            </div>

            <hr className="border-[#1F2937]" />

            {/* Sección: Precios y Fechas */}
            <h2 className="text-lg font-semibold tracking-tight text-slate-200">Precios y Tiempos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Precio Base (USD)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('basePrice', { valueAsNumber: true })}
                error={errors.basePrice?.message}
              />
              <Input
                label="Incremento Mínimo (USD)"
                type="number"
                step="0.01"
                placeholder="10.00"
                {...register('minIncrement', { valueAsNumber: true })}
                error={errors.minIncrement?.message}
              />
              <Input
                label="Fecha y Hora de Inicio"
                type="datetime-local"
                {...register('startDate')}
                error={errors.startDate?.message}
              />
              <Input
                label="Fecha y Hora de Fin"
                type="datetime-local"
                {...register('endDate')}
                error={errors.endDate?.message}
              />
            </div>

            <hr className="border-[#1F2937]" />

            {/* Sección: Imagen */}
            <h2 className="text-lg font-semibold tracking-tight text-slate-200">Imagen del Producto</h2>
            
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                isDragging 
                  ? 'border-[#2F8CFF] bg-[#2F8CFF]/5' 
                  : previewUrl ? 'border-[#1F2937] bg-[#0B0B12]' : 'border-[#1F2937] bg-[#0B0B12] hover:bg-[#111827]'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              {previewUrl ? (
                <div className="relative w-full max-w-sm">
                  <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-xl object-cover" />
                  <button 
                    type="button" 
                    onClick={clearImage}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-[#1F2937] flex items-center justify-center text-slate-400 mb-4">
                    <ImageIcon size={32} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">Subir Imagen</h3>
                  <p className="text-xs text-slate-400 mb-4 text-center max-w-xs">
                    Arrastra y suelta tu imagen aquí, o haz clic para buscar en tus archivos.
                  </p>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar Archivo
                  </Button>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-end">
              <div className="w-full sm:w-64">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full h-12 text-base font-semibold"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={20} className="animate-spin" /> 
                      Publicando...
                    </span>
                  ) : (
                    'Publicar Subasta'
                  )}
                </Button>
              </div>
            </div>

          </form>

        </div>
      </main>
    </div>
  );
};
