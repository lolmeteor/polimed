"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ConsentFormProps {
  onConsent: () => void
  onDecline: () => void
}

export function ConsentForm({ onConsent, onDecline }: ConsentFormProps) {
  const [isChecked, setIsChecked] = useState(false)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [isDeclineHovered, setIsDeclineHovered] = useState(false)

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked)
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-[18px] font-semibold text-txt-primary mb-4">Согласие на обработку персональных данных</h2>

      <div className="bg-white border-2 border-brand rounded-crd p-4 mb-6 max-h-[300px] overflow-y-auto">
        <p className="text-[14px] leading-[20px] text-txt-secondary mb-4">
          Я, пользователь сервиса «Полимедика», даю свое согласие ООО «Медицинский девелопмент» (ООО «МД»),
          расположенному по&nbsp;адресу: [юридический адрес], на&nbsp;обработку моих персональных данных на&nbsp;следующих условиях:
        </p>

        <ol className="list-decimal pl-5 text-[14px] leading-[20px] text-txt-secondary mb-4 space-y-2">
          <li>
            Согласие дается на&nbsp;обработку следующих персональных данных: номер телефона, имя, фамилия, отчество, дата
            рождения, а&nbsp;также идентификатор пользователя в&nbsp;мессенджере Telegram.
          </li>
          <li>
            Цель обработки персональных данных: предоставление доступа к&nbsp;сервису записи на&nbsp;прием к&nbsp;врачам через
            мини-приложение в&nbsp;Telegram, идентификация пользователя, связь учетной записи пользователя в&nbsp;Telegram с
            учетной записью в&nbsp;информационной системе клиники.
          </li>
          <li>
            Персональные данные обрабатываются путем связывания идентификатора пользователя в&nbsp;Telegram с&nbsp;идентификатором
            пациента в&nbsp;информационной системе клиники.
          </li>
          <li>
            Согласие действует до&nbsp;момента удаления учетной записи пользователя из&nbsp;системы или до&nbsp;момента отзыва согласия
            пользователем.
          </li>
          <li>
            Пользователь имеет право отозвать свое согласие, направив запрос в&nbsp;клинику «Полимедика» через форму обратной
            связи или при личном обращении в&nbsp;регистратуру.
          </li>
          <li>
            Все персональные данные пациента обрабатываются исключительно через API клиники «Полимедика» и&nbsp;не&nbsp;передаются
            третьим лицам, за&nbsp;исключением случаев, предусмотренных законодательством РФ.
          </li>
        </ol>
      </div>

      <div className="flex items-start mb-6">
        <div className="flex items-center h-5">
          <input
            id="consent"
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="w-5 h-5 border-2 border-brand rounded focus:ring-brand"
          />
        </div>
        <label htmlFor="consent" className="ml-2 text-[14px] text-txt-secondary">
          Я прочитал(а) и&nbsp;согласен(на) с&nbsp;условиями обработки персональных данных
        </label>
      </div>

      <div className="flex flex-col space-y-3">
        <button
          onClick={onConsent}
          disabled={!isChecked}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className={cn(
            "w-full sm:w-[275px] h-[50px] rounded-btn font-semibold text-[16px] transition-colors duration-200 border-2 border-brand",
            !isChecked
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
              : isButtonHovered
                ? "bg-brand text-white"
                : "bg-white text-txt-primary",
          )}
        >
          Принять и продолжить
        </button>

        <button
          onClick={onDecline}
          onMouseEnter={() => setIsDeclineHovered(true)}
          onMouseLeave={() => setIsDeclineHovered(false)}
          className={cn(
            "w-full sm:w-[275px] h-[50px] rounded-btn font-semibold text-[16px] transition-colors duration-200",
            isDeclineHovered ? "text-brand-error" : "text-txt-secondary",
          )}
        >
          Отказаться
        </button>
      </div>
    </div>
  )
}

