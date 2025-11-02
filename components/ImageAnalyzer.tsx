import React, { useState, useCallback } from 'react';
import { analyzeImage } from '../services/geminiService';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
    </div>
);

const ImageAnalyzer: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload a valid image file (PNG, JPG, etc.).');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImage(base64String);
                setAnalysis('');
                setError('');
                generateAnalysis(base64String, file.type);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const generateAnalysis = async (base64String: string, mimeType: string) => {
        setIsLoading(true);
        try {
            // Remove the base64 prefix
            const pureBase64 = base64String.split(',')[1];
            const result = await analyzeImage(pureBase64, mimeType);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to analyze the image. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section id="demo" className="py-20 md:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100">See Your Photos in a New Light</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-300">
                        Upload a photo and let our AI assistant reveal its hidden story.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
                    <div className="flex flex-col items-center">
                        <div className="w-full aspect-square bg-slate-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600 relative overflow-hidden">
                            {image ? (
                                <img src={image} alt="Upload preview" className="object-contain h-full w-full" />
                            ) : (
                                <div className="text-center text-slate-400">
                                    <p>Your photo will appear here.</p>
                                </div>
                            )}
                        </div>
                        <label className="mt-6 inline-flex items-center bg-emerald-500 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer">
                            <UploadIcon />
                            <span>{image ? 'Upload Another Photo' : 'Choose a Photo'}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                         {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-lg min-h-[300px] flex flex-col">
                         <h3 className="text-xl font-bold text-slate-100 mb-4">AI Analysis</h3>
                         <div className="prose prose-invert prose-slate max-w-none text-sm text-slate-300 flex-grow overflow-y-auto">
                            {isLoading && <LoadingSpinner />}
                            {!isLoading && !analysis && (
                                <p>The story behind your photo will be generated here...</p>
                            )}
                            {analysis && <p>{analysis.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</p>}
                         </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ImageAnalyzer;
