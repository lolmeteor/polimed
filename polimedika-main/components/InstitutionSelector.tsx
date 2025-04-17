"use client";

import React, { useEffect, useState } from 'react';
import { misApiService, District, MedicalInstitution } from '../services/mis-api-service';
import { useUserContext } from '../contexts/UserContext';
import { toast } from 'sonner';

const InstitutionSelector: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [institutions, setInstitutions] = useState<MedicalInstitution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { setSelectedInstitution } = useUserContext();

  // Загрузка списка районов при монтировании
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const districtsData = await misApiService.getDistricts();
        setDistricts(districtsData);
      } catch (error) {
        console.error('Ошибка при загрузке районов:', error);
      }
    };

    fetchDistricts();
  }, []);

  // Загрузка учреждений при выборе района
  const handleDistrictChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = event.target.value;
    setSelectedDistrict(districtId);
    
    if (districtId) {
      setLoading(true);
      try {
        const institutionsData = await misApiService.getMedicalInstitutionsByDistrict(districtId);
        setInstitutions(institutionsData);
      } catch (error) {
        console.error('Ошибка при загрузке учреждений:', error);
        setInstitutions([]);
      } finally {
        setLoading(false);
      }
    } else {
      setInstitutions([]);
    }
  };

  // Выбор учреждения
  const handleInstitutionSelect = (institution: MedicalInstitution) => {
    setSelectedInstitution(institution);
    toast.success(`Выбрано учреждение: ${institution.name}`);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4">Выбор медицинского учреждения</h2>
      
      <div className="mb-4">
        <label htmlFor="district-select" className="block text-sm font-medium text-gray-700 mb-1">
          Район
        </label>
        <select
          id="district-select"
          value={selectedDistrict}
          onChange={handleDistrictChange}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Не выбрано</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center py-4">Загрузка учреждений...</p>
      ) : (
        <>
          {selectedDistrict && institutions.length === 0 ? (
            <p className="text-center py-4">В выбранном районе нет доступных учреждений</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {institutions.map((institution) => (
                <div
                  key={institution.id}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleInstitutionSelect(institution)}
                >
                  <h3 className="text-lg font-medium">{institution.name}</h3>
                  <div className="flex items-center mt-2 text-gray-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>{institution.address}</span>
                  </div>
                  {institution.phone && (
                    <div className="flex items-center mt-2 text-gray-600">
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                      <span>{institution.phone}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InstitutionSelector; 