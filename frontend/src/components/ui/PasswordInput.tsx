'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
    id: string
    name: string
    placeholder?: string
    autoComplete?: string
    minLength?: number
    required?: boolean
    dark?: boolean
}

export function PasswordInput({
    id,
    name,
    placeholder = '••••••••',
    autoComplete = 'current-password',
    minLength,
    required,
    dark = false,
}: PasswordInputProps) {
    const [visible, setVisible] = useState(false)

    const inputStyle = dark
        ? { background: '#252219', border: '1px solid #33301F', color: '#FFFFFF' }
        : { background: 'var(--background)', border: '1px solid #EDE5D3', color: 'var(--foreground)' }

    const iconColor = dark ? '#9A8E70' : '#A69060'

    return (
        <div className="relative">
            <input
                id={id}
                name={name}
                type={visible ? 'text' : 'password'}
                autoComplete={autoComplete}
                required={required}
                minLength={minLength}
                placeholder={placeholder}
                className={`${dark ? 'input-estetiqo-dark' : 'input-estetiqo'} w-full rounded-xl px-4 py-3 pr-11 text-sm transition-all`}
                style={inputStyle}
            />
            <button
                type="button"
                onClick={() => setVisible(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
                style={{ color: iconColor }}
                tabIndex={-1}
                aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    )
}
