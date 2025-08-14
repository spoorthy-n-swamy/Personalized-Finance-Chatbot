"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Globe, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface CountrySelectionProps {
  onSelectCountry: (country: string, currency: string) => void
  onBack: () => void
  userDemographic: "student" | "professional"
}

const countries = [
  { name: "Afghanistan", currency: "AFN", flag: "🇦🇫", taxInfo: "Income tax, Business tax" },
  { name: "Albania", currency: "ALL", flag: "🇦🇱", taxInfo: "Income tax, VAT" },
  { name: "Algeria", currency: "DZD", flag: "🇩🇿", taxInfo: "Income tax, VAT" },
  { name: "Andorra", currency: "EUR", flag: "🇦🇩", taxInfo: "Income tax, IGI" },
  { name: "Angola", currency: "AOA", flag: "🇦🇴", taxInfo: "Income tax, VAT" },
  { name: "Argentina", currency: "ARS", flag: "🇦🇷", taxInfo: "Income tax, VAT, Wealth tax" },
  { name: "Armenia", currency: "AMD", flag: "🇦🇲", taxInfo: "Income tax, VAT" },
  { name: "Australia", currency: "AUD", flag: "🇦🇺", taxInfo: "Income tax, Superannuation" },
  { name: "Austria", currency: "EUR", flag: "🇦🇹", taxInfo: "Income tax, VAT" },
  { name: "Azerbaijan", currency: "AZN", flag: "🇦🇿", taxInfo: "Income tax, VAT" },
  { name: "Bahamas", currency: "BSD", flag: "🇧🇸", taxInfo: "No income tax, VAT" },
  { name: "Bahrain", currency: "BHD", flag: "🇧🇭", taxInfo: "No income tax, VAT" },
  { name: "Bangladesh", currency: "BDT", flag: "🇧🇩", taxInfo: "Income tax, VAT" },
  { name: "Barbados", currency: "BBD", flag: "🇧🇧", taxInfo: "Income tax, VAT" },
  { name: "Belarus", currency: "BYN", flag: "🇧🇾", taxInfo: "Income tax, VAT" },
  { name: "Belgium", currency: "EUR", flag: "🇧🇪", taxInfo: "Income tax, VAT" },
  { name: "Belize", currency: "BZD", flag: "🇧🇿", taxInfo: "Income tax, GST" },
  { name: "Benin", currency: "XOF", flag: "🇧🇯", taxInfo: "Income tax, VAT" },
  { name: "Bhutan", currency: "BTN", flag: "🇧🇹", taxInfo: "Income tax, Sales tax" },
  { name: "Bolivia", currency: "BOB", flag: "🇧🇴", taxInfo: "Income tax, VAT" },
  { name: "Bosnia and Herzegovina", currency: "BAM", flag: "🇧🇦", taxInfo: "Income tax, VAT" },
  { name: "Botswana", currency: "BWP", flag: "🇧🇼", taxInfo: "Income tax, VAT" },
  { name: "Brazil", currency: "BRL", flag: "🇧🇷", taxInfo: "Income tax, ICMS, IPI" },
  { name: "Brunei", currency: "BND", flag: "🇧🇳", taxInfo: "No income tax, GST" },
  { name: "Bulgaria", currency: "BGN", flag: "🇧🇬", taxInfo: "Income tax, VAT" },
  { name: "Burkina Faso", currency: "XOF", flag: "🇧🇫", taxInfo: "Income tax, VAT" },
  { name: "Burundi", currency: "BIF", flag: "🇧🇮", taxInfo: "Income tax, VAT" },
  { name: "Cambodia", currency: "KHR", flag: "🇰🇭", taxInfo: "Income tax, VAT" },
  { name: "Cameroon", currency: "XAF", flag: "🇨🇲", taxInfo: "Income tax, VAT" },
  { name: "Canada", currency: "CAD", flag: "🇨🇦", taxInfo: "Federal & Provincial taxes, RRSP" },
  { name: "Cape Verde", currency: "CVE", flag: "🇨🇻", taxInfo: "Income tax, VAT" },
  { name: "Central African Republic", currency: "XAF", flag: "🇨🇫", taxInfo: "Income tax, VAT" },
  { name: "Chad", currency: "XAF", flag: "🇹🇩", taxInfo: "Income tax, VAT" },
  { name: "Chile", currency: "CLP", flag: "🇨🇱", taxInfo: "Income tax, VAT" },
  { name: "China", currency: "CNY", flag: "🇨🇳", taxInfo: "Income tax, VAT" },
  { name: "Colombia", currency: "COP", flag: "🇨🇴", taxInfo: "Income tax, VAT" },
  { name: "Comoros", currency: "KMF", flag: "🇰🇲", taxInfo: "Income tax, VAT" },
  { name: "Congo", currency: "XAF", flag: "🇨🇬", taxInfo: "Income tax, VAT" },
  { name: "Costa Rica", currency: "CRC", flag: "🇨🇷", taxInfo: "Income tax, Sales tax" },
  { name: "Croatia", currency: "EUR", flag: "🇭🇷", taxInfo: "Income tax, VAT" },
  { name: "Cuba", currency: "CUP", flag: "🇨🇺", taxInfo: "Income tax, Sales tax" },
  { name: "Cyprus", currency: "EUR", flag: "🇨🇾", taxInfo: "Income tax, VAT" },
  { name: "Czech Republic", currency: "CZK", flag: "🇨🇿", taxInfo: "Income tax, VAT" },
  { name: "Denmark", currency: "DKK", flag: "🇩🇰", taxInfo: "Income tax, VAT" },
  { name: "Djibouti", currency: "DJF", flag: "🇩🇯", taxInfo: "Income tax, VAT" },
  { name: "Dominica", currency: "XCD", flag: "🇩🇲", taxInfo: "Income tax, VAT" },
  { name: "Dominican Republic", currency: "DOP", flag: "🇩🇴", taxInfo: "Income tax, ITBIS" },
  { name: "Ecuador", currency: "USD", flag: "🇪🇨", taxInfo: "Income tax, VAT" },
  { name: "Egypt", currency: "EGP", flag: "🇪🇬", taxInfo: "Income tax, VAT" },
  { name: "El Salvador", currency: "USD", flag: "🇸🇻", taxInfo: "Income tax, VAT" },
  { name: "Equatorial Guinea", currency: "XAF", flag: "🇬🇶", taxInfo: "Income tax, VAT" },
  { name: "Eritrea", currency: "ERN", flag: "🇪🇷", taxInfo: "Income tax, Sales tax" },
  { name: "Estonia", currency: "EUR", flag: "🇪🇪", taxInfo: "Income tax, VAT" },
  { name: "Eswatini", currency: "SZL", flag: "🇸🇿", taxInfo: "Income tax, VAT" },
  { name: "Ethiopia", currency: "ETB", flag: "🇪🇹", taxInfo: "Income tax, VAT" },
  { name: "Fiji", currency: "FJD", flag: "🇫🇯", taxInfo: "Income tax, VAT" },
  { name: "Finland", currency: "EUR", flag: "🇫🇮", taxInfo: "Income tax, VAT" },
  { name: "France", currency: "EUR", flag: "🇫🇷", taxInfo: "Income tax, VAT, Social charges" },
  { name: "Gabon", currency: "XAF", flag: "🇬🇦", taxInfo: "Income tax, VAT" },
  { name: "Gambia", currency: "GMD", flag: "🇬🇲", taxInfo: "Income tax, VAT" },
  { name: "Georgia", currency: "GEL", flag: "🇬🇪", taxInfo: "Income tax, VAT" },
  { name: "Germany", currency: "EUR", flag: "🇩🇪", taxInfo: "Income tax, VAT, Pension" },
  { name: "Ghana", currency: "GHS", flag: "🇬🇭", taxInfo: "Income tax, VAT" },
  { name: "Greece", currency: "EUR", flag: "🇬🇷", taxInfo: "Income tax, VAT" },
  { name: "Grenada", currency: "XCD", flag: "🇬🇩", taxInfo: "Income tax, VAT" },
  { name: "Guatemala", currency: "GTQ", flag: "🇬🇹", taxInfo: "Income tax, VAT" },
  { name: "Guinea", currency: "GNF", flag: "🇬🇳", taxInfo: "Income tax, VAT" },
  { name: "Guinea-Bissau", currency: "XOF", flag: "🇬🇼", taxInfo: "Income tax, VAT" },
  { name: "Guyana", currency: "GYD", flag: "🇬🇾", taxInfo: "Income tax, VAT" },
  { name: "Haiti", currency: "HTG", flag: "🇭🇹", taxInfo: "Income tax, VAT" },
  { name: "Honduras", currency: "HNL", flag: "🇭🇳", taxInfo: "Income tax, Sales tax" },
  { name: "Hungary", currency: "HUF", flag: "🇭🇺", taxInfo: "Income tax, VAT" },
  { name: "Iceland", currency: "ISK", flag: "🇮🇸", taxInfo: "Income tax, VAT" },
  { name: "India", currency: "INR", flag: "🇮🇳", taxInfo: "Income tax, GST, LTCG/STCG" },
  { name: "Indonesia", currency: "IDR", flag: "🇮🇩", taxInfo: "Income tax, VAT" },
  { name: "Iran", currency: "IRR", flag: "🇮🇷", taxInfo: "Income tax, VAT" },
  { name: "Iraq", currency: "IQD", flag: "🇮🇶", taxInfo: "Income tax, Sales tax" },
  { name: "Ireland", currency: "EUR", flag: "🇮🇪", taxInfo: "Income tax, VAT" },
  { name: "Israel", currency: "ILS", flag: "🇮🇱", taxInfo: "Income tax, VAT" },
  { name: "Italy", currency: "EUR", flag: "🇮🇹", taxInfo: "Income tax, VAT" },
  { name: "Ivory Coast", currency: "XOF", flag: "🇨🇮", taxInfo: "Income tax, VAT" },
  { name: "Jamaica", currency: "JMD", flag: "🇯🇲", taxInfo: "Income tax, GCT" },
  { name: "Japan", currency: "JPY", flag: "🇯🇵", taxInfo: "Income tax, Consumption tax" },
  { name: "Jordan", currency: "JOD", flag: "🇯🇴", taxInfo: "Income tax, Sales tax" },
  { name: "Kazakhstan", currency: "KZT", flag: "🇰🇿", taxInfo: "Income tax, VAT" },
  { name: "Kenya", currency: "KES", flag: "🇰🇪", taxInfo: "Income tax, VAT" },
  { name: "Kiribati", currency: "AUD", flag: "🇰🇮", taxInfo: "Income tax, VAT" },
  { name: "Kuwait", currency: "KWD", flag: "🇰🇼", taxInfo: "No income tax, VAT" },
  { name: "Kyrgyzstan", currency: "KGS", flag: "🇰🇬", taxInfo: "Income tax, VAT" },
  { name: "Laos", currency: "LAK", flag: "🇱🇦", taxInfo: "Income tax, VAT" },
  { name: "Latvia", currency: "EUR", flag: "🇱🇻", taxInfo: "Income tax, VAT" },
  { name: "Lebanon", currency: "LBP", flag: "🇱🇧", taxInfo: "Income tax, VAT" },
  { name: "Lesotho", currency: "LSL", flag: "🇱🇸", taxInfo: "Income tax, VAT" },
  { name: "Liberia", currency: "LRD", flag: "🇱🇷", taxInfo: "Income tax, GST" },
  { name: "Libya", currency: "LYD", flag: "🇱🇾", taxInfo: "Income tax, VAT" },
  { name: "Liechtenstein", currency: "CHF", flag: "🇱🇮", taxInfo: "Income tax, VAT" },
  { name: "Lithuania", currency: "EUR", flag: "🇱🇹", taxInfo: "Income tax, VAT" },
  { name: "Luxembourg", currency: "EUR", flag: "🇱🇺", taxInfo: "Income tax, VAT" },
  { name: "Madagascar", currency: "MGA", flag: "🇲🇬", taxInfo: "Income tax, VAT" },
  { name: "Malawi", currency: "MWK", flag: "🇲🇼", taxInfo: "Income tax, VAT" },
  { name: "Malaysia", currency: "MYR", flag: "🇲🇾", taxInfo: "Income tax, SST" },
  { name: "Maldives", currency: "MVR", flag: "🇲🇻", taxInfo: "No income tax, GST" },
  { name: "Mali", currency: "XOF", flag: "🇲🇱", taxInfo: "Income tax, VAT" },
  { name: "Malta", currency: "EUR", flag: "🇲🇹", taxInfo: "Income tax, VAT" },
  { name: "Marshall Islands", currency: "USD", flag: "🇲🇭", taxInfo: "Income tax, VAT" },
  { name: "Mauritania", currency: "MRU", flag: "🇲🇷", taxInfo: "Income tax, VAT" },
  { name: "Mauritius", currency: "MUR", flag: "🇲🇺", taxInfo: "Income tax, VAT" },
  { name: "Mexico", currency: "MXN", flag: "🇲🇽", taxInfo: "Income tax, VAT" },
  { name: "Micronesia", currency: "USD", flag: "🇫🇲", taxInfo: "Income tax, Sales tax" },
  { name: "Moldova", currency: "MDL", flag: "🇲🇩", taxInfo: "Income tax, VAT" },
  { name: "Monaco", currency: "EUR", flag: "🇲🇨", taxInfo: "No income tax, VAT" },
  { name: "Mongolia", currency: "MNT", flag: "🇲🇳", taxInfo: "Income tax, VAT" },
  { name: "Montenegro", currency: "EUR", flag: "🇲🇪", taxInfo: "Income tax, VAT" },
  { name: "Morocco", currency: "MAD", flag: "🇲🇦", taxInfo: "Income tax, VAT" },
  { name: "Mozambique", currency: "MZN", flag: "🇲🇿", taxInfo: "Income tax, VAT" },
  { name: "Myanmar", currency: "MMK", flag: "🇲🇲", taxInfo: "Income tax, Commercial tax" },
  { name: "Namibia", currency: "NAD", flag: "🇳🇦", taxInfo: "Income tax, VAT" },
  { name: "Nauru", currency: "AUD", flag: "🇳🇷", taxInfo: "No income tax, GST" },
  { name: "Nepal", currency: "NPR", flag: "🇳🇵", taxInfo: "Income tax, VAT" },
  { name: "Netherlands", currency: "EUR", flag: "🇳🇱", taxInfo: "Income tax, VAT, Pension" },
  { name: "New Zealand", currency: "NZD", flag: "🇳🇿", taxInfo: "Income tax, GST" },
  { name: "Nicaragua", currency: "NIO", flag: "🇳🇮", taxInfo: "Income tax, VAT" },
  { name: "Niger", currency: "XOF", flag: "🇳🇪", taxInfo: "Income tax, VAT" },
  { name: "Nigeria", currency: "NGN", flag: "🇳🇬", taxInfo: "Income tax, VAT" },
  { name: "North Korea", currency: "KPW", flag: "🇰🇵", taxInfo: "State controlled economy" },
  { name: "North Macedonia", currency: "MKD", flag: "🇲🇰", taxInfo: "Income tax, VAT" },
  { name: "Norway", currency: "NOK", flag: "🇳🇴", taxInfo: "Income tax, VAT" },
  { name: "Oman", currency: "OMR", flag: "🇴🇲", taxInfo: "No income tax, VAT" },
  { name: "Pakistan", currency: "PKR", flag: "🇵🇰", taxInfo: "Income tax, Sales tax" },
  { name: "Palau", currency: "USD", flag: "🇵🇼", taxInfo: "Income tax, Sales tax" },
  { name: "Panama", currency: "PAB", flag: "🇵🇦", taxInfo: "Income tax, ITBMS" },
  { name: "Papua New Guinea", currency: "PGK", flag: "🇵🇬", taxInfo: "Income tax, GST" },
  { name: "Paraguay", currency: "PYG", flag: "🇵🇾", taxInfo: "Income tax, VAT" },
  { name: "Peru", currency: "PEN", flag: "🇵🇪", taxInfo: "Income tax, IGV" },
  { name: "Philippines", currency: "PHP", flag: "🇵🇭", taxInfo: "Income tax, VAT" },
  { name: "Poland", currency: "PLN", flag: "🇵🇱", taxInfo: "Income tax, VAT" },
  { name: "Portugal", currency: "EUR", flag: "🇵🇹", taxInfo: "Income tax, VAT" },
  { name: "Qatar", currency: "QAR", flag: "🇶🇦", taxInfo: "No income tax, VAT" },
  { name: "Romania", currency: "RON", flag: "🇷🇴", taxInfo: "Income tax, VAT" },
  { name: "Russia", currency: "RUB", flag: "🇷🇺", taxInfo: "Income tax, VAT" },
  { name: "Rwanda", currency: "RWF", flag: "🇷🇼", taxInfo: "Income tax, VAT" },
  { name: "Saint Kitts and Nevis", currency: "XCD", flag: "🇰🇳", taxInfo: "Income tax, VAT" },
  { name: "Saint Lucia", currency: "XCD", flag: "🇱🇨", taxInfo: "Income tax, VAT" },
  { name: "Saint Vincent and the Grenadines", currency: "XCD", flag: "🇻🇨", taxInfo: "Income tax, VAT" },
  { name: "Samoa", currency: "WST", flag: "🇼🇸", taxInfo: "Income tax, VAGST" },
  { name: "San Marino", currency: "EUR", flag: "🇸🇲", taxInfo: "Income tax, VAT" },
  { name: "Sao Tome and Principe", currency: "STN", flag: "🇸🇹", taxInfo: "Income tax, VAT" },
  { name: "Saudi Arabia", currency: "SAR", flag: "🇸🇦", taxInfo: "No income tax, VAT" },
  { name: "Senegal", currency: "XOF", flag: "🇸🇳", taxInfo: "Income tax, VAT" },
  { name: "Serbia", currency: "RSD", flag: "🇷🇸", taxInfo: "Income tax, VAT" },
  { name: "Seychelles", currency: "SCR", flag: "🇸🇨", taxInfo: "Income tax, VAT" },
  { name: "Sierra Leone", currency: "SLE", flag: "🇸🇱", taxInfo: "Income tax, GST" },
  { name: "Singapore", currency: "SGD", flag: "🇸🇬", taxInfo: "Income tax, CPF, GST" },
  { name: "Slovakia", currency: "EUR", flag: "🇸🇰", taxInfo: "Income tax, VAT" },
  { name: "Slovenia", currency: "EUR", flag: "🇸🇮", taxInfo: "Income tax, VAT" },
  { name: "Solomon Islands", currency: "SBD", flag: "🇸🇧", taxInfo: "Income tax, VAT" },
  { name: "Somalia", currency: "SOS", flag: "🇸🇴", taxInfo: "Income tax, Sales tax" },
  { name: "South Africa", currency: "ZAR", flag: "🇿🇦", taxInfo: "Income tax, VAT" },
  { name: "South Korea", currency: "KRW", flag: "🇰🇷", taxInfo: "Income tax, VAT" },
  { name: "South Sudan", currency: "SSP", flag: "🇸🇸", taxInfo: "Income tax, VAT" },
  { name: "Spain", currency: "EUR", flag: "🇪🇸", taxInfo: "Income tax, VAT" },
  { name: "Sri Lanka", currency: "LKR", flag: "🇱🇰", taxInfo: "Income tax, VAT" },
  { name: "Sudan", currency: "SDG", flag: "🇸🇩", taxInfo: "Income tax, VAT" },
  { name: "Suriname", currency: "SRD", flag: "🇸🇷", taxInfo: "Income tax, VAT" },
  { name: "Sweden", currency: "SEK", flag: "🇸🇪", taxInfo: "Income tax, VAT" },
  { name: "Switzerland", currency: "CHF", flag: "🇨🇭", taxInfo: "Income tax, VAT" },
  { name: "Syria", currency: "SYP", flag: "🇸🇾", taxInfo: "Income tax, Sales tax" },
  { name: "Taiwan", currency: "TWD", flag: "🇹🇼", taxInfo: "Income tax, VAT" },
  { name: "Tajikistan", currency: "TJS", flag: "🇹🇯", taxInfo: "Income tax, VAT" },
  { name: "Tanzania", currency: "TZS", flag: "🇹🇿", taxInfo: "Income tax, VAT" },
  { name: "Thailand", currency: "THB", flag: "🇹🇭", taxInfo: "Income tax, VAT" },
  { name: "Timor-Leste", currency: "USD", flag: "🇹🇱", taxInfo: "Income tax, Sales tax" },
  { name: "Togo", currency: "XOF", flag: "🇹🇬", taxInfo: "Income tax, VAT" },
  { name: "Tonga", currency: "TOP", flag: "🇹🇴", taxInfo: "Income tax, VAT" },
  { name: "Trinidad and Tobago", currency: "TTD", flag: "🇹🇹", taxInfo: "Income tax, VAT" },
  { name: "Tunisia", currency: "TND", flag: "🇹🇳", taxInfo: "Income tax, VAT" },
  { name: "Turkey", currency: "TRY", flag: "🇹🇷", taxInfo: "Income tax, VAT" },
  { name: "Turkmenistan", currency: "TMT", flag: "🇹🇲", taxInfo: "Income tax, VAT" },
  { name: "Tuvalu", currency: "AUD", flag: "🇹🇻", taxInfo: "Income tax, VAT" },
  { name: "Uganda", currency: "UGX", flag: "🇺🇬", taxInfo: "Income tax, VAT" },
  { name: "Ukraine", currency: "UAH", flag: "🇺🇦", taxInfo: "Income tax, VAT" },
  { name: "United Arab Emirates", currency: "AED", flag: "🇦🇪", taxInfo: "No income tax, VAT" },
  { name: "United Kingdom", currency: "GBP", flag: "🇬🇧", taxInfo: "Income tax, ISA, Pension" },
  { name: "United States", currency: "USD", flag: "🇺🇸", taxInfo: "Federal & State taxes, 401k" },
  { name: "Uruguay", currency: "UYU", flag: "🇺🇾", taxInfo: "Income tax, VAT" },
  { name: "Uzbekistan", currency: "UZS", flag: "🇺🇿", taxInfo: "Income tax, VAT" },
  { name: "Vanuatu", currency: "VUV", flag: "🇻🇺", taxInfo: "No income tax, VAT" },
  { name: "Vatican City", currency: "EUR", flag: "🇻🇦", taxInfo: "No income tax, VAT" },
  { name: "Venezuela", currency: "VES", flag: "🇻🇪", taxInfo: "Income tax, VAT" },
  { name: "Vietnam", currency: "VND", flag: "🇻🇳", taxInfo: "Income tax, VAT" },
  { name: "Yemen", currency: "YER", flag: "🇾🇪", taxInfo: "Income tax, Sales tax" },
  { name: "Zambia", currency: "ZMW", flag: "🇿🇲", taxInfo: "Income tax, VAT" },
  { name: "Zimbabwe", currency: "ZWL", flag: "🇿🇼", taxInfo: "Income tax, VAT" },
]

export function CountrySelection({ onSelectCountry, onBack, userDemographic }: CountrySelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCountries = countries.filter((country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="text-center mb-12">
        <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto mb-6">
          <Globe className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Select your country</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Choose your country to get personalized tax guidance and currency-specific financial advice
          {userDemographic === "student" ? " tailored for students" : " for professionals"}.
        </p>
      </div>

      <div className="mb-8 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search for your country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCountries.map((country) => (
          <Card
            key={country.name}
            className="border-slate-200 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => onSelectCountry(country.name, country.currency)}
          >
            <CardHeader className="text-center pb-4">
              <div className="text-4xl mb-3">{country.flag}</div>
              <CardTitle className="text-xl mb-2">{country.name}</CardTitle>
              <CardDescription className="text-sm">
                Currency: <span className="font-semibold text-primary">{country.currency}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{country.taxInfo}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Local investment options</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>Regional financial regulations</span>
                </div>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => onSelectCountry(country.name, country.currency)}
              >
                Select {country.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-500">No countries found matching "{searchTerm}"</p>
          <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">
            Clear search
          </Button>
        </div>
      )}

      <div className="text-center mt-8">
        <p className="text-sm text-slate-500">
          Don't see your country? You can still use the chatbot with general financial guidance.
        </p>
      </div>
    </div>
  )
}
