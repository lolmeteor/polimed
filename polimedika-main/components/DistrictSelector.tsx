import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/user-context';
import { misApiService, District } from '../services/mis-api-service';
import { Spinner, Box, Select, FormControl, FormLabel } from '@chakra-ui/react';

const DistrictSelector: React.FC = () => {
  const { setSelectedDistrict, userProfile, setLoading, loading } = useUser();
  const [districts, setDistricts] = useState<District[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка районов/участков
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!userProfile) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const districtsData = await misApiService.getDistrictList();
        setDistricts(districtsData);
      } catch (err) {
        console.error('Ошибка при загрузке районов:', err);
        setError('Не удалось загрузить список районов. Пожалуйста, повторите попытку позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, [userProfile, setLoading]);

  // Обработчик выбора района
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    
    if (selectedValue) {
      const selected = districts.find(district => district.id === selectedValue);
      if (selected) {
        setSelectedDistrict(selected);
      }
    } else {
      setSelectedDistrict(null);
    }
  };

  // Если данные загружаются - показываем спиннер
  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <Spinner size="md" color="teal.500" />
      </Box>
    );
  }

  // Если произошла ошибка - показываем сообщение
  if (error) {
    return (
      <Box color="red.500" p={2} textAlign="center">
        {error}
      </Box>
    );
  }

  return (
    <FormControl>
      <FormLabel fontWeight="medium">Выберите район/участок</FormLabel>
      <Select 
        placeholder="Выберите район"
        onChange={handleDistrictChange}
      >
        {districts.map(district => (
          <option key={district.id} value={district.id}>
            {district.name}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

export default DistrictSelector; 