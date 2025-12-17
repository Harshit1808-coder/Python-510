
import React, { useState, useRef } from 'react';
import useGeolocation from '../../hooks/useGeolocation';
import { RescueReport } from '../../types';
import Spinner from '../../components/Spinner';
import { analyzeInjury } from '../../services/geminiService';

interface NewReportProps {
  onBack: () => void;
  onSubmit: (reportData: Omit<RescueReport, 'id' | 'userId' | 'status' | 'ngoId' | 'createdAt' | 'updatedAt' | 'chat'>) => void;
}

const NewReport: React.FC<NewReportProps> = ({ onBack, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile || !description || !location) {
      alert('Please fill all fields, upload a photo, and ensure location is enabled.');
      return;
    }

    setIsSubmitting(true);
    try {
      const geminiAnalysis = await analyzeInjury(photoFile, description);
      const reportData = {
        animalPhoto: photoPreview!,
        description,
        location,
        geminiAnalysis,
      };
      onSubmit(reportData);
    } catch (error) {
      console.error("Submission failed:", error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-2xl">
      <button onClick={onBack} className="text-emerald-600 hover:text-emerald-800 mb-4">&larr; Back to Dashboard</button>
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Report an Animal in Need</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo of the Animal
            </label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Animal preview" className="max-h-60 rounded-md object-contain" />
              ) : (
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <p className="pl-1">Click to upload a file</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Describe the animal's condition, location details, etc."
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <div className="mt-1 p-3 bg-gray-100 rounded-md">
              {locationLoading && <p className="text-gray-500">Fetching location...</p>}
              {locationError && <p className="text-red-500">{locationError}</p>}
              {location && <p className="text-gray-800">Location captured: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || locationLoading || !location || !photoFile}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300"
          >
            {isSubmitting ? <Spinner /> : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewReport;
