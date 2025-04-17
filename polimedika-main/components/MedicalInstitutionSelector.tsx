import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  FormLabel, 
  Select, 
  Spinner, 
  Alert, 
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box
} from '@chakra-ui/react';
import { useUserContext } from '../contexts/UserContext';
import { misApiService, MedicalInstitution } from '../services/mis-api-service';

interface MedicalInstitutionSelectorProps {
  districtId: string | null;
  onInstitutionSelect?: (institutionId: string) => void;
}

export const MedicalInstitutionSelector: React.FC<MedicalInstitutionSelectorProps> = ({ 
  districtId,
  onInstitutionSelect 
}) => {
  const { setSelectedInstitution } = useUserContext();
  const [institutions, setInstitutions] = useState<MedicalInstitution[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем список медицинских учреждений при изменении districtId
  useEffect(() => {
    async function fetchInstitutions() {
      if (!districtId) {
        setInstitutions([]);
        setSelectedId('');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await misApiService.getMedicalInstitutionsByDistrict(districtId);
        setInstitutions(response.data);
        
        // Сбрасываем выбранное учреждение
        setSelectedId('');
      } catch (err) {
        console.error('Ошибка при загрузке медицинских учреждений:', err);
        setError('Не удалось загрузить список медицинских учреждений. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchInstitutions();
  }, [districtId]);

  // Обработчик изменения выбранного учреждения
  const handleInstitutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const institutionId = e.target.value;
    setSelectedId(institutionId);
    
    // Обновляем контекст пользователя
    const selectedInstitution = institutions.find(inst => inst.id === institutionId);
    if (selectedInstitution) {
      setSelectedInstitution(selectedInstitution);
    }

    // Вызываем callback, если он предоставлен
    if (onInstitutionSelect) {
      onInstitutionSelect(institutionId);
    }
  };

  // Если загружаем, показываем спиннер
  if (isLoading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="md" color="blue.500" />
      </Box>
    );
  }

  // Если произошла ошибка, показываем сообщение
  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Ошибка!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Если нет выбранного района, не показываем селект
  if (!districtId) {
    return null;
  }

  return (
    <FormControl id="institution" mb={4}>
      <FormLabel>Выберите медицинское учреждение</FormLabel>
      <Select 
        placeholder="Выберите поликлинику" 
        value={selectedId}
        onChange={handleInstitutionChange}
        isDisabled={institutions.length === 0}
      >
        {institutions.map((institution) => (
          <option key={institution.id} value={institution.id}>
            {institution.name}
          </option>
        ))}
      </Select>
      {institutions.length === 0 && !isLoading && (
        <Alert status="info" mt={2} size="sm">
          <AlertIcon />
          В выбранном районе нет доступных медицинских учреждений
        </Alert>
      )}
    </FormControl>
  );
};

export default MedicalInstitutionSelector; 