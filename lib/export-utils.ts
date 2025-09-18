import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import Papa from 'papaparse'

/**
 * Export data to CSV format
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param headers - Optional custom headers mapping
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
) {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Transform data if headers mapping is provided
  let processedData: any[] = data
  if (headers) {
    processedData = data.map(item => {
      const transformedItem: Record<string, any> = {}
      Object.keys(item).forEach(key => {
        const newKey = headers[key as keyof T] || key
        transformedItem[newKey] = item[key]
      })
      return transformedItem
    })
  }

  // Convert data to CSV format
  const csv = Papa.unparse(processedData, {
    header: true
  })

  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export HTML element to PDF
 * @param elementId - ID of the HTML element to export
 * @param filename - Name of the file (without extension)
 * @param title - Optional title for the PDF
 */
export async function exportToPDF(
  elementId: string,
  filename: string,
  title?: string
) {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`)
    return
  }

  try {
    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // Add title if provided
    if (title) {
      pdf.setFontSize(20)
      pdf.text(title, 20, 20)
      pdf.setFontSize(12)
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30)
    }

    // Calculate dimensions
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = title ? 40 : 20

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add new pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Save PDF
    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}

/**
 * Export executive summary data to CSV
 * @param deliveries - Array of delivery records
 */
export function exportExecutiveSummaryCSV(deliveries: any[]) {
  const csvData = deliveries.map(delivery => ({
    'Delivery Date': delivery.delivery_date,
    'Milk Gallons': delivery.milk_gallons,
    'Bread Delivered': delivery.bread_delivered,
    'Egg Trays': delivery.egg_trays,
    'Misc Items': delivery.misc_items || '',
    'Goal Achieved': delivery.goal_achieved ? 'Yes' : 'No',
    'Cost Milk': delivery.cost_milk,
    'Cost Eggs': delivery.cost_eggs,
    'Cost Bread': delivery.cost_bread,
    'Additional Cost': delivery.additional_cost,
    'Total Cost': delivery.cost_milk + delivery.cost_eggs + delivery.cost_bread + delivery.additional_cost,
    'Total Items': delivery.milk_gallons + delivery.bread_delivered + delivery.egg_trays,
    'Improvement Areas': delivery.improvement_areas || ''
  }))

  exportToCSV(csvData, 'executive-summary-deliveries')
}

/**
 * Export analytics data to CSV
 * @param analyticsData - Analytics data object
 */
export function exportAnalyticsCSV(analyticsData: any) {
  const csvData = []

  // Add summary metrics
  csvData.push({
    'Metric': 'Total Seniors',
    'Value': analyticsData.monthly?.seniorsServed || 0,
    'Category': 'Summary'
  })
  csvData.push({
    'Metric': 'Success Rate (%)',
    'Value': analyticsData.monthly?.successRate || 0,
    'Category': 'Summary'
  })
  csvData.push({
    'Metric': 'Active Volunteers',
    'Value': analyticsData.monthly?.activeVolunteers || 0,
    'Category': 'Summary'
  })
  csvData.push({
    'Metric': 'Total Deliveries',
    'Value': analyticsData.monthly?.totalDeliveries || 0,
    'Category': 'Summary'
  })

  // Add accessibility metrics
  if (analyticsData.accessibility) {
    csvData.push({
      'Metric': 'Seniors Needing Translation',
      'Value': analyticsData.accessibility.seniorsNeedingTranslation || 0,
      'Category': 'Accessibility'
    })
    csvData.push({
      'Metric': 'Seniors With Smartphones',
      'Value': analyticsData.accessibility.seniorsWithSmartphones || 0,
      'Category': 'Accessibility'
    })
    csvData.push({
      'Metric': 'Seniors Without Smartphones',
      'Value': analyticsData.accessibility.seniorsWithoutSmartphones || 0,
      'Category': 'Accessibility'
    })
    csvData.push({
      'Metric': 'Languages Supported',
      'Value': Object.keys(analyticsData.accessibility.languageBreakdown || {}).length,
      'Category': 'Accessibility'
    })
  }

  // Add delivery status breakdown
  if (analyticsData.deliveries) {
    const statusBreakdown = analyticsData.deliveries.reduce((acc: any, delivery: any) => {
      acc[delivery.status] = (acc[delivery.status] || 0) + 1
      return acc
    }, {})

    Object.entries(statusBreakdown).forEach(([status, count]) => {
      csvData.push({
        'Metric': `Status: ${status}`,
        'Value': count,
        'Category': 'Delivery Status'
      })
    })
  }

  exportToCSV(csvData, 'analytics-dashboard')
}

/**
 * Export delivery records to CSV
 * @param deliveries - Array of delivery records with senior and volunteer info
 */
export function exportDeliveriesCSV(deliveries: any[]) {
  const csvData = deliveries.map(delivery => ({
    'Delivery Date': delivery.delivery_date,
    'Status': delivery.status,
    'Delivery Method': delivery.delivery_method || '',
    'Notes': delivery.notes || '',
    'Not Delivered Reason': delivery.not_delivered_reason || '',
    'Language Barrier': delivery.language_barrier_encountered ? 'Yes' : 'No',
    'Translation Needed': delivery.translation_needed ? 'Yes' : 'No',
    'Senior Name': delivery.senior?.name || '',
    'Senior Address': delivery.senior?.address || '',
    'Senior Phone': delivery.senior?.phone || '',
    'Volunteer Name': delivery.volunteer?.name || '',
    'Volunteer Email': delivery.volunteer?.email || '',
    'Created At': delivery.created_at,
    'Completed At': delivery.completed_at || ''
  }))

  exportToCSV(csvData, 'delivery-records')
}
