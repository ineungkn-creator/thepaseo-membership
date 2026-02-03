'use client'

type Option = {
  value: string
  label: string
}

type Props = {
  value?: string
  placeholder?: string
  options: Option[]
  disabled?: boolean
  onChange: (value: string) => void
}

export default function SimpleSelect({
  value,
  placeholder = 'กรุณาเลือก',
  options,
  disabled,
  onChange,
}: Props) {
  return (
    <select
      disabled={disabled}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pt-6 pb-2 pl-2 pr-4 border rounded-xl bg-gray-100
                 focus:outline-none focus:ring focus:ring-paseo
                 disabled:bg-gray-200 disabled:text-gray-400"
    >
      <option value="" disabled>
        {placeholder}
      </option>

      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
