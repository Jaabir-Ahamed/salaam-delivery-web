"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  Eye,
  EyeOff,
  Trash2
} from "lucide-react"
import { SupabaseService } from "@/lib/supabase-service"
import { Senior } from "@/lib/supabase"

interface CSVImportProps {
  onImportComplete?: () => void
}

interface CSVRow {
  name: string
  age: string
  household_type: "single" | "family"
  family_adults: string
  family_children: string
  race_ethnicity: string
  health_conditions: string
  address: string
  dietary_restrictions: string
  phone: string
  emergency_contact: string
  has_smartphone: string
  preferred_language: string
  needs_translation: string
  delivery_method: "doorstep" | "phone_confirmed" | "family_member"
  special_instructions: string
}

export function CSVImport({ onImportComplete }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [previewData, setPreviewData] = useState<CSVRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [importResults, setImportResults] = useState<{
    total: number
    successful: number
    failed: number
    errors: string[]
  } | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      setError("Please select a CSV file")
      return
    }

    setFile(selectedFile)
    setError("")
    setSuccess("")
    setImportResults(null)
    setCsvData([])
    setPreviewData([])

    try {
      const text = await selectedFile.text()
      const rows = parseCSV(text)
      setCsvData(rows)
      setPreviewData(rows.slice(0, 5)) // Show first 5 rows for preview
    } catch (error) {
      setError("Error reading CSV file: " + (error as Error).message)
    }
  }

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header and one data row")
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))
    const dataRows = lines.slice(1)

    return dataRows.map((row, index) => {
      const values = row.split(',').map(v => v.trim())
      const rowData: any = {}

      headers.forEach((header, i) => {
        rowData[header] = values[i] || ''
      })

      // Validate and transform data
      return {
        name: rowData.name || rowData.full_name || '',
        age: rowData.age || '0',
        household_type: (rowData.household_type || 'single') as "single" | "family",
        family_adults: rowData.family_adults || rowData.adults || '1',
        family_children: rowData.family_children || rowData.children || '0',
        race_ethnicity: rowData.race_ethnicity || rowData.ethnicity || '',
        health_conditions: rowData.health_conditions || rowData.health || '',
        address: rowData.address || '',
        dietary_restrictions: rowData.dietary_restrictions || rowData.dietary || '',
        phone: rowData.phone || rowData.phone_number || '',
        emergency_contact: rowData.emergency_contact || rowData.emergency || '',
        has_smartphone: rowData.has_smartphone || rowData.smartphone || 'false',
        preferred_language: rowData.preferred_language || rowData.language || 'english',
        needs_translation: rowData.needs_translation || rowData.translation || 'false',
        delivery_method: (rowData.delivery_method || 'doorstep') as "doorstep" | "phone_confirmed" | "family_member",
        special_instructions: rowData.special_instructions || rowData.instructions || ''
      }
    }).filter(row => row.name.trim()) // Filter out empty rows
  }

  const validateData = (data: CSVRow[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    data.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because of 0-based index and header row

      if (!row.name.trim()) {
        errors.push(`Row ${rowNumber}: Name is required`)
      }

      const age = parseInt(row.age)
      if (isNaN(age) || age < 0 || age > 120) {
        errors.push(`Row ${rowNumber}: Age must be a valid number between 0 and 120`)
      }

      if (!row.address.trim()) {
        errors.push(`Row ${rowNumber}: Address is required`)
      }

      const familyAdults = parseInt(row.family_adults)
      if (isNaN(familyAdults) || familyAdults < 0) {
        errors.push(`Row ${rowNumber}: Family adults must be a valid number`)
      }

      const familyChildren = parseInt(row.family_children)
      if (isNaN(familyChildren) || familyChildren < 0) {
        errors.push(`Row ${rowNumber}: Family children must be a valid number`)
      }

      if (!['single', 'family'].includes(row.household_type)) {
        errors.push(`Row ${rowNumber}: Household type must be 'single' or 'family'`)
      }

      if (!['doorstep', 'phone_confirmed', 'family_member'].includes(row.delivery_method)) {
        errors.push(`Row ${rowNumber}: Delivery method must be 'doorstep', 'phone_confirmed', or 'family_member'`)
      }
    })

    return { valid: errors.length === 0, errors }
  }

  const processData = async () => {
    if (!csvData.length) {
      setError("No data to process")
      return
    }

    setIsProcessing(true)
    setError("")

    const validation = validateData(csvData)
    if (!validation.valid) {
      setError("Validation errors found:\n" + validation.errors.join('\n'))
      setIsProcessing(false)
      return
    }

    setSuccess(`Data validation passed! ${csvData.length} records ready for import.`)
    setIsProcessing(false)
  }

  const importData = async () => {
    if (!csvData.length) {
      setError("No data to import")
      return
    }

    setIsImporting(true)
    setError("")
    setSuccess("")

    const results = {
      total: csvData.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    }

    try {
      // Convert CSV data to Senior format
      const seniorsData = csvData.map(row => ({
        name: row.name.trim(),
        age: parseInt(row.age),
        household_type: row.household_type,
        family_adults: parseInt(row.family_adults),
        family_children: parseInt(row.family_children),
        race_ethnicity: row.race_ethnicity || null,
        health_conditions: row.health_conditions || null,
        address: row.address.trim(),
        dietary_restrictions: row.dietary_restrictions || null,
        phone: row.phone || null,
        emergency_contact: row.emergency_contact || null,
        has_smartphone: row.has_smartphone.toLowerCase() === 'true',
        preferred_language: row.preferred_language.toLowerCase(),
        needs_translation: row.needs_translation.toLowerCase() === 'true',
        delivery_method: row.delivery_method,
        special_instructions: row.special_instructions || null,
        active: true
      }))

      // Import in batches of 10
      const batchSize = 10
      for (let i = 0; i < seniorsData.length; i += batchSize) {
        const batch = seniorsData.slice(i, i + batchSize)
        
        try {
          const result = await SupabaseService.bulkCreateSeniors(batch)
          if (result.error) {
            results.failed += batch.length
            results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${result.error.message}`)
          } else {
            results.successful += batch.length
          }
        } catch (error) {
          results.failed += batch.length
          results.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${(error as Error).message}`)
        }
      }

      setImportResults(results)
      
      if (results.successful > 0) {
        setSuccess(`Successfully imported ${results.successful} out of ${results.total} records.`)
        if (onImportComplete) {
          onImportComplete()
        }
      }

      if (results.failed > 0) {
        setError(`${results.failed} records failed to import. Check the details below.`)
      }

    } catch (error) {
      setError("Import failed: " + (error as Error).message)
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = `name,age,household_type,family_adults,family_children,race_ethnicity,health_conditions,address,dietary_restrictions,phone,emergency_contact,has_smartphone,preferred_language,needs_translation,delivery_method,special_instructions
John Doe,75,single,1,0,White,Diabetes,123 Main St,None,555-0123,Jane Doe (555-0124),true,english,false,doorstep,Leave at front door
Maria Garcia,68,family,2,1,Hispanic,None,456 Oak Ave,Gluten-free,555-0125,Carlos Garcia (555-0126),false,spanish,true,phone_confirmed,Call before delivery`
    
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "seniors-import-template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetForm = () => {
    setFile(null)
    setCsvData([])
    setPreviewData([])
    setError("")
    setSuccess("")
    setImportResults(null)
    setShowPreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Add this function to handle the Sequoia Common data format
  const handleSequoiaCommonImport = async (data: any[]) => {
    const seniors = data.map((row, index) => ({
      name: `${row['First Name'] || ''} ${row['Last Name'] || ''}`.trim() || `Resident ${index + 1}`,
      address: `${row['Street']}, Unit ${row['# Unit/Apt']}, Fremont, CA ${row['# #z Code']}`,
      unit_apt: row['# Unit/Apt'] || '',
      zip_code: row['# #z Code'] || '94538',
      building: row['Building'] || 'Sequoia Common',
      street: row['Street'] || '40798 Fremont Blvd',
      phone: null,
      email: null,
      dietary_restrictions: row['Special Instructions'] || null,
      special_instructions: row['Reference'] || null,
      emergency_contact: null,
      active: true
    })).filter(senior => senior.name !== 'Resident' && senior.unit_apt);

    // Import seniors
    for (const senior of seniors) {
      try {
        await SupabaseService.createSenior(senior);
      } catch (error) {
        console.error(`Error importing senior ${senior.name}:`, error);
      }
    }

    return seniors.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-green-800">CSV Import</h2>
        <p className="text-gray-600">Bulk import seniors from CSV files</p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>
            Select a CSV file containing senior information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                ref={fileInputRef}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadTemplate} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              {file && (
                <Button onClick={processData} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Process Data
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Data Preview */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Data Preview
                </CardTitle>
                <CardDescription>
                  Showing first 5 rows of {csvData.length} total records
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? "Hide" : "Show"} Details
              </Button>
            </div>
          </CardHeader>
          {showPreview && (
            <CardContent>
              <div className="space-y-4">
                {previewData.map((row, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Name:</strong> {row.name}
                      </div>
                      <div>
                        <strong>Age:</strong> {row.age}
                      </div>
                      <div>
                        <strong>Address:</strong> {row.address}
                      </div>
                      <div>
                        <strong>Phone:</strong> {row.phone || 'N/A'}
                      </div>
                      <div>
                        <strong>Household:</strong> {row.household_type} ({row.family_adults} adults, {row.family_children} children)
                      </div>
                      <div>
                        <strong>Language:</strong> {row.preferred_language} {row.needs_translation === 'true' && '(needs translation)'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Import Actions */}
      {csvData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Import Actions
            </CardTitle>
            <CardDescription>
              Import {csvData.length} records into the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={importData} disabled={isImporting}>
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import {csvData.length} Records
                  </>
                )}
              </Button>
              <Button onClick={resetForm} variant="outline">
                <Trash2 className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Import Results
            </CardTitle>
            <CardDescription>
              Summary of the import operation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{importResults.total}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResults.successful}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importResults.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Errors:</h4>
                <div className="space-y-1">
                  {importResults.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
