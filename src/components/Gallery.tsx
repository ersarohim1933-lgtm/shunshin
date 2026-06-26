import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, updateDoc, doc, increment } from 'firebase/firestore';
import { Image as ImageIcon, Plus, Upload, User, Calendar, X, FileText, Sparkles, Heart, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  playerName: string;
  category: string;
  likes: number;
  createdAt: any; // Timestamp or date string
}

// Pre-seeded high quality Minecraft-themed placeholders if db is empty
const STATIC_FALLBACK_PHOTOS: GalleryPhoto[] = [
  {
    id: 'static-1',
    title: 'Keindahan Pagi di Spawn Shunshine',
    description: 'Pemandangan matahari terbit yang sangat memukau di area lobi spawn utama server Shunshine Minecraft.',
    imageUrl: 'https://images.unsplash.com/photo-1607988795691-3d0147b43231?q=80&w=1200&auto=format&fit=crop',
    playerName: 'AdminShun',
    category: 'Survival',
    likes: 42,
    createdAt: { toDate: () => new Date('2026-06-15') }
  },
  {
    id: 'static-2',
    title: 'Pasar Rakyat & Ekonomi Mandiri',
    description: 'Salah satu area pertokoan pemain (Player Shops) yang ramai dikunjungi para petualang untuk jual-beli sumber daya.',
    imageUrl: 'https://images.unsplash.com/photo-1605899435973-ca2d1a8861cf?q=80&w=1200&auto=format&fit=crop',
    playerName: 'RajaGrief',
    category: 'Bangunan',
    likes: 29,
    createdAt: { toDate: () => new Date('2026-06-20') }
  },
  {
    id: 'static-3',
    title: 'Kastil Megah Faksi Utara',
    description: 'Mahakarya kastil pertahanan kokoh yang dibangun oleh faksi aliansi utara. Bebas dirampok jika pertahanan mereka jebol!',
    imageUrl: 'https://images.unsplash.com/photo-1589244159943-460088ed5c92?q=80&w=1200&auto=format&fit=crop',
    playerName: 'Arsitek_MC',
    category: 'Bangunan',
    likes: 56,
    createdAt: { toDate: () => new Date('2026-06-25') }
  }
];

export default function Gallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<GalleryPhoto | null>(null);
  
  // Form States
  const [playerName, setPlayerName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Survival');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  // Likes local persistence state to prevent double-liking
  const [likedPhotoIds, setLikedPhotoIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load liked items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shunshine_liked_photos');
    if (saved) {
      try {
        setLikedPhotoIds(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing liked photos', e);
      }
    }
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const dbPhotos: GalleryPhoto[] = [];
      
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        dbPhotos.push({
          id: docSnap.id,
          title: data.title || 'Tanpa Judul',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          playerName: data.playerName || 'Pemain',
          category: data.category || 'Lainnya',
          likes: data.likes || 0,
          createdAt: data.createdAt || null
        });
      });

      // If empty in Firestore, combine or fall back to static seeds so the site looks amazing
      if (dbPhotos.length === 0) {
        setPhotos(STATIC_FALLBACK_PHOTOS);
      } else {
        // We can prepend static ones or just show Firestore ones
        setPhotos(dbPhotos);
      }
    } catch (err) {
      console.error('Error fetching gallery photos, falling back to seeds:', err);
      setPhotos(STATIC_FALLBACK_PHOTOS);
    } finally {
      setLoading(false);
    }
  };

  // Compress image on client side using canvas
  const processAndCompressFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('File harus berupa gambar (PNG/JPG/JPEG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale to maximum dimension of 1024px to keep Base64 size very reasonable
        const MAX_DIM = 1024;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.75 quality for beautiful detail but ultra lightweight size
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          setImagePreview(compressedBase64);
          setErrorMessage('');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      processAndCompressFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      processAndCompressFile(file);
    }
  };

  const handleLike = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening lightbox
    
    if (likedPhotoIds.includes(photoId)) {
      return; // Already liked
    }

    // Update local state first
    const updatedLikes = [...likedPhotoIds, photoId];
    setLikedPhotoIds(updatedLikes);
    localStorage.setItem('shunshine_liked_photos', JSON.stringify(updatedLikes));

    // Update UI immediately for responsiveness
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, likes: p.likes + 1 } : p));
    if (activeLightboxPhoto?.id === photoId) {
      setActiveLightboxPhoto(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }

    // Update Firestore if it is not a static seed
    if (!photoId.startsWith('static-')) {
      try {
        const docRef = doc(db, 'gallery', photoId);
        await updateDoc(docRef, {
          likes: increment(1)
        });
      } catch (err) {
        console.error('Error updating like on server:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setErrorMessage('Silakan masukkan Username Minecraft (IGN) Anda!');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Silakan masukkan Judul screenshot Anda!');
      return;
    }
    if (!imagePreview) {
      setErrorMessage('Silakan pilih atau seret foto yang ingin diunggah!');
      return;
    }

    setUploading(true);
    setErrorMessage('');

    try {
      // Save directly to firestore
      const newPhotoData = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imagePreview,
        playerName: playerName.trim(),
        category: category,
        likes: 0,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'gallery'), newPhotoData);

      // Reset Form & Close Modal
      setPlayerName('');
      setTitle('');
      setDescription('');
      setCategory('Survival');
      setSelectedFile(null);
      setImagePreview(null);
      setShowUploadModal(false);
      
      // Refresh list
      await fetchPhotos();
    } catch (err: any) {
      console.error('Failed to upload photo:', err);
      setErrorMessage(`Gagal menyimpan foto: ${err.message || 'Error tidak diketahui'}`);
    } finally {
      setUploading(false);
    }
  };

  const filteredPhotos = selectedCategory === 'Semua' 
    ? photos 
    : photos.filter(p => p.category === selectedCategory);

  const categoriesList = ['Semua', 'Survival', 'Bangunan', 'Event', 'Lainnya'];

  const formatDate = (photo: GalleryPhoto) => {
    if (!photo.createdAt) return 'Baru Saja';
    try {
      const date = photo.createdAt.toDate ? photo.createdAt.toDate() : new Date(photo.createdAt);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return 'Baru Saja';
    }
  };

  return (
    <section id="gallery" className="py-24 px-4 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border-t border-neutral-900 relative overflow-hidden">
      {/* Visual Accent Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-4 tracking-wider uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Galeri Komunitas Shunshine
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-sans font-bold text-white tracking-tight mb-4"
          >
            Potret Seru di <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Dunia Shunshine</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-neutral-400 max-w-2xl mx-auto text-base md:text-lg font-light leading-relaxed mb-8"
          >
            Bagikan maha karyamu, dekorasi base terbaik, pertempuran epik faksitmu, atau momen-momen bertahan hidup paling berkesan langsung ke website!
          </motion.p>

          {/* Category Filter and Upload Action Header */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-neutral-800 pb-6">
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  id={`cat-${cat.toLowerCase()}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-neutral-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <button
              id="btn-trigger-upload"
              onClick={() => {
                setErrorMessage('');
                setShowUploadModal(true);
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs md:text-sm px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Unggah Foto Kamu
            </button>
          </div>
        </div>

        {/* Gallery Grid Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-neutral-400 font-medium">Memuat galeri foto terbaik...</p>
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-24 bg-neutral-900/40 border border-neutral-800/60 rounded-3xl p-8 max-w-md mx-auto">
            <ImageIcon className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Galeri Kosong</h3>
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              Belum ada foto dalam kategori <span className="text-amber-400 font-semibold">"{selectedCategory}"</span> yang diunggah oleh pemain.
            </p>
            <button
              onClick={() => {
                setErrorMessage('');
                setShowUploadModal(true);
              }}
              className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs px-4 py-2.5 rounded-xl border border-amber-500/20"
            >
              Mulai Unggah Pertama
            </button>
          </div>
        ) : (
          /* Bento/Masonry Grid of Photos */
          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                  onClick={() => setActiveLightboxPhoto(photo)}
                  className="group bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-[380px]"
                >
                  {/* Photo Container */}
                  <div className="relative h-56 w-full overflow-hidden bg-neutral-950">
                    <img 
                      src={photo.imageUrl} 
                      alt={photo.title}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    
                    {/* Category Label Overlay */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-950/85 text-amber-400 border border-neutral-800/80 text-[10px] font-bold uppercase tracking-wider">
                        {photo.category}
                      </span>
                    </div>

                    {/* Like Action Floating Overlay */}
                    <button
                      id={`btn-like-grid-${photo.id}`}
                      onClick={(e) => handleLike(photo.id, e)}
                      className={`absolute bottom-3 right-3 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 scale-90 group-hover:scale-100 ${
                        likedPhotoIds.includes(photo.id)
                          ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                          : 'bg-neutral-950/80 hover:bg-neutral-950 text-neutral-300 hover:text-rose-400 border border-neutral-800'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedPhotoIds.includes(photo.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex flex-col justify-between flex-grow">
                    <div>
                      {/* Meta info: Player & Date */}
                      <div className="flex items-center gap-3 text-neutral-500 text-xs mb-2">
                        <span className="flex items-center gap-1 text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 font-mono">
                          <User className="w-3.5 h-3.5" />
                          {photo.playerName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(photo)}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors duration-200">
                        {photo.title}
                      </h3>
                      <p className="text-neutral-400 text-xs line-clamp-2 mt-2 leading-relaxed">
                        {photo.description || 'Tidak ada deskripsi tambahan.'}
                      </p>
                    </div>

                    {/* Bottom Likes indicator */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50 mt-4 text-xs text-neutral-500">
                      <span>Klik untuk detail foto</span>
                      <span className="flex items-center gap-1 text-neutral-400">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                        <strong className="text-white">{photo.likes}</strong> disukai
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Upload Modal overlay */}
        <AnimatePresence>
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Unggah Screenshot</h3>
                      <p className="text-xs text-neutral-400">Karya terhebatmu di server Shunshine</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-grow">
                  {errorMessage && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                      {errorMessage}
                    </div>
                  )}

                  {/* Input Player Name & Category Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                        Username IGN Minecraft <span className="text-amber-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Contoh: Arsitek_MC"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                        Kategori Foto <span className="text-amber-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-colors cursor-pointer"
                      >
                        <option value="Survival">Survival</option>
                        <option value="Bangunan">Bangunan</option>
                        <option value="Event">Event</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>

                  {/* Input Judul */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                      Judul Foto <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Panen Raya Faksi Utara"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-colors"
                    />
                  </div>

                  {/* Input Deskripsi */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                      Deskripsi Singkat (Opsional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ceritakan momen seru di balik foto ini..."
                      rows={3}
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-amber-500/50 rounded-xl p-4 text-sm text-white placeholder-neutral-600 outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* File Upload Drag & Drop Zone */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                      Screenshot Gambar <span className="text-amber-500">*</span>
                    </label>
                    
                    {imagePreview ? (
                      /* Image Preview Container */
                      <div className="relative bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden p-2">
                        <img 
                          src={imagePreview} 
                          alt="Pratinjau Unggah" 
                          className="w-full max-h-56 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-4 right-4 p-2 bg-neutral-900/90 hover:bg-red-500 text-neutral-300 hover:text-white rounded-xl transition-colors cursor-pointer border border-neutral-800/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="p-3 text-center text-xs text-neutral-400 font-mono">
                          Gambar siap diunggah & dikompresi otomatis (~ {Math.round(imagePreview.length / 1.33 / 1024)} KB)
                        </div>
                      </div>
                    ) : (
                      /* Drop Zone */
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                          dragActive 
                            ? 'border-amber-500 bg-amber-500/5' 
                            : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/40 hover:bg-neutral-950/80'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Upload className="w-10 h-10 text-neutral-600 mx-auto mb-3 group-hover:text-amber-400" />
                        <p className="text-sm font-semibold text-neutral-200">
                          Klik untuk pilih atau Seret Gambar ke sini
                        </p>
                        <p className="text-xs text-neutral-500 mt-2">
                          Mendukung PNG, JPG, JPEG (Max 10MB, akan dikompresi otomatis)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="pt-4 border-t border-neutral-800/60 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => setShowUploadModal(false)}
                      className="px-5 py-3 rounded-xl text-sm font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    >
                      Batal
                    </button>
                    
                    <button
                      type="submit"
                      disabled={uploading}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 cursor-pointer"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sedang Menyimpan...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Simpan ke Galeri
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Lightbox Photo View Overlay */}
        <AnimatePresence>
          {activeLightboxPhoto && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto"
              onClick={() => setActiveLightboxPhoto(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()} // Prevent closing
                className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
              >
                {/* Photo Left Side */}
                <div className="relative bg-black flex items-center justify-center flex-grow md:w-3/5 select-none h-[300px] sm:h-[400px] md:h-auto min-h-[350px]">
                  <img 
                    src={activeLightboxPhoto.imageUrl} 
                    alt={activeLightboxPhoto.title}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Category overlay */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-xl bg-neutral-900/90 text-amber-400 text-[10px] md:text-xs font-bold uppercase tracking-wider border border-neutral-800">
                      {activeLightboxPhoto.category}
                    </span>
                  </div>
                </div>

                {/* Details Right Side */}
                <div className="p-6 md:p-8 flex flex-col justify-between md:w-2/5 border-t md:border-t-0 md:border-l border-neutral-800 bg-neutral-900/90">
                  <div>
                    {/* Close Action Top Right (Desktop Only) */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Detail Foto Screenshot</span>
                      </div>
                      <button
                        onClick={() => setActiveLightboxPhoto(null)}
                        className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Uploader IGN Steve Face */}
                    <div className="flex items-center gap-3 bg-neutral-950/60 border border-neutral-800/80 p-3.5 rounded-2xl mb-6">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                        <User className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">Diupload Oleh</div>
                        <div className="text-white font-mono font-bold text-base mt-0.5">{activeLightboxPhoto.playerName}</div>
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
                      {activeLightboxPhoto.title}
                    </h3>

                    <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                      {activeLightboxPhoto.description || 'Tidak ada deskripsi tambahan.'}
                    </p>
                  </div>

                  <div>
                    {/* Date info */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 border-t border-neutral-800/50 pt-5 mb-5 font-mono">
                      <Calendar className="w-4 h-4 text-neutral-600" />
                      <span>Diambil pada: {formatDate(activeLightboxPhoto)}</span>
                    </div>

                    {/* Like Action bottom */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider leading-none">Total Dukungan</span>
                        <span className="text-white text-lg font-extrabold mt-1">
                          {activeLightboxPhoto.likes} <span className="text-xs text-neutral-400 font-normal">Pemain Menyukai</span>
                        </span>
                      </div>

                      <button
                        id={`btn-like-lightbox-${activeLightboxPhoto.id}`}
                        onClick={(e) => handleLike(activeLightboxPhoto.id, e)}
                        className={`inline-flex items-center gap-2 font-bold text-xs md:text-sm px-5 py-3 rounded-xl transition-all cursor-pointer ${
                          likedPhotoIds.includes(activeLightboxPhoto.id)
                            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                            : 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.25)] hover:shadow-[0_0_25px_rgba(244,63,94,0.45)]'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedPhotoIds.includes(activeLightboxPhoto.id) ? 'fill-current text-rose-400' : 'text-white'}`} />
                        {likedPhotoIds.includes(activeLightboxPhoto.id) ? 'Sudah Menyukai' : 'Sukai Foto ini'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
