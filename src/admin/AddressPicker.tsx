import { PROVINCES, WARDS, provinceName } from '@/lib/vn-address'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'

export interface AddressValue { street: string; ward: string; province: string }

/** Ghép địa chỉ đầy đủ để hiển thị & tìm trên bản đồ. */
export function composeAddress(v: AddressValue) {
  const prov = provinceName(v.province)
  return [v.street, v.ward, prov].filter(Boolean).join(', ')
}

export function AddressPicker({ value, onChange }: { value: AddressValue; onChange: (v: AddressValue) => void }) {
  const wards = WARDS[value.province] ?? []
  const set = (patch: Partial<AddressValue>) => onChange({ ...value, ...patch })
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Tỉnh / Thành phố</Label>
          <Combobox
            value={value.province}
            onChange={(province) => set({ province })}
            placeholder="Chọn tỉnh/thành"
            searchPlaceholder="Tìm tỉnh/thành…"
            options={PROVINCES.map((p) => ({ value: p.code, label: p.name }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Phường / Xã</Label>
          <Combobox
            value={value.ward}
            onChange={(ward) => set({ ward })}
            placeholder="Chọn hoặc gõ phường/xã"
            searchPlaceholder="Tìm hoặc nhập tên mới…"
            empty="Gõ tên phường/xã rồi chọn “Dùng: …”"
            allowCustom
            options={wards.map((w) => ({ value: w, label: w }))}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Số nhà / Đường</Label>
        <Input value={value.street} onChange={(e) => set({ street: e.target.value })} placeholder="VD: 16/63 Tuệ Tĩnh" />
      </div>
      <div className="rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
        Địa chỉ đầy đủ: <b className="text-foreground">{composeAddress(value) || '(chưa nhập)'}</b>
        <div className="text-xs mt-1">Theo đơn vị hành chính Việt Nam 2025 (34 tỉnh/thành, đủ danh sách phường/xã). Vẫn có thể gõ tay nếu cần.</div>
      </div>
    </div>
  )
}
