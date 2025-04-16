'use client';

import { useState, useEffect } from 'react';
import { debugConfig } from '@/services/api-config';
import { hubServiceClient } from '@/services/hub-service-client';
import { authService } from '@/services/auth-service';

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState('getDistrictList');

  // Проверка ключа доступа
  const checkSecretKey = () => {
    if (secretKey === debugConfig.secretKey) {
      setIsVisible(true);
      localStorage.setItem('polimed_debug_key', secretKey);
    } else {
      alert('Неверный ключ');
      setIsVisible(false);
      localStorage.removeItem('polimed_debug_key');
    }
  };

  // Загрузка ключа из localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('polimed_debug_key');
    if (savedKey) {
      setSecretKey(savedKey);
      if (savedKey === debugConfig.secretKey) {
        setIsVisible(true);
      }
    }
  }, []);

  // Обработка вызовов API
  const handleApiCall = async () => {
    setIsLoading(true);
    setApiResponse(null);
    
    try {
      let response;
      
      switch (selectedAction) {
        case 'getDistrictList':
          response = await hubServiceClient.getDistrictList();
          break;
        case 'getLPUList':
          response = await hubServiceClient.getLPUList('74');
          break;
        case 'getSpecialityList':
          response = await hubServiceClient.getSpecialityList();
          break;
        case 'getToken':
          response = await authService.getToken(true);
          break;
        default:
          throw new Error('Неизвестное действие');
      }
      
      setApiResponse(response);
    } catch (error) {
      setApiResponse({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!debugConfig.isEnabled) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Панель отладки</h2>
        <div className="flex gap-2">
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Введите секретный ключ"
            className="px-3 py-2 border rounded"
          />
          <button
            onClick={checkSecretKey}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Панель отладки (GUID: {hubServiceClient['guid'].substring(0, 8)}...)</h2>
        <button
          onClick={() => setIsVisible(false)}
          className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Скрыть
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Выберите API-запрос:</label>
        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="getDistrictList">GetDistrictList</option>
          <option value="getLPUList">GetLPUList</option>
          <option value="getSpecialityList">GetSpecialityList</option>
          <option value="getToken">Получить токен</option>
        </select>
      </div>
      
      <button
        onClick={handleApiCall}
        disabled={isLoading}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
      >
        {isLoading ? 'Загрузка...' : 'Выполнить запрос'}
      </button>
      
      {apiResponse && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Результат:</h3>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Конфигурация:</p>
        <ul className="list-disc list-inside">
          <li>GUID: {hubServiceClient['guid'].substring(0, 8)}...</li>
          <li>WSDL URL: {hubServiceConfig.wsdlUrl}</li>
          <li>Token URL: {hubServiceConfig.tokenUrl}</li>
          <li>Default LPU ID: {hubServiceConfig.defaultLpuId}</li>
        </ul>
      </div>
    </div>
  );
} 