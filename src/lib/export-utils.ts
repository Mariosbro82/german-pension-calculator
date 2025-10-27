/**
 * Export and sharing utilities for charts, data, and results
 */

import html2canvas from 'html2canvas';

/**
 * Download a chart as PNG image
 */
export const downloadChartAsPNG = async (
  elementId: string,
  filename: string = 'chart'
): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id '${elementId}' not found`);
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
    });

    const link = document.createElement('a');
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error downloading chart:', error);
    throw error;
  }
};

/**
 * Download data as CSV
 */
export const downloadDataAsCSV = (
  data: any[],
  filename: string = 'data',
  headers?: string[]
): void => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to download');
    }

    // Extract headers from first object if not provided
    const csvHeaders = headers || Object.keys(data[0]);

    // Convert data to CSV format
    const csvRows = [
      csvHeaders.join(','), // Header row
      ...data.map((row) =>
        csvHeaders.map((header) => {
          const value = row[header];
          // Escape values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error downloading CSV:', error);
    throw error;
  }
};

/**
 * Download data as JSON
 */
export const downloadDataAsJSON = (
  data: any,
  filename: string = 'data'
): void => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error downloading JSON:', error);
    throw error;
  }
};

/**
 * Share via Web Share API (mobile-friendly)
 */
export const shareContent = async (
  title: string,
  text: string,
  url?: string
): Promise<boolean> => {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url: url || window.location.href,
      });
      return true;
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url || window.location.href);
      return false; // Indicates fallback was used
    }
  } catch (error) {
    console.error('Error sharing:', error);
    throw error;
  }
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback: Failed to copy', err);
      throw err;
    }
    document.body.removeChild(textArea);
  }
};

/**
 * Generate shareable link with state
 */
export const generateShareableLink = (
  baseUrl: string,
  params: Record<string, any>
): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  return `${baseUrl}?${searchParams.toString()}`;
};

/**
 * Format number for display
 */
export const formatNumber = (
  value: number,
  locale: string = 'de-DE',
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

/**
 * Format currency for display
 */
export const formatCurrency = (
  value: number,
  locale: string = 'de-DE',
  currency: string = 'EUR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format percentage for display
 */
export const formatPercent = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Download options interface
 */
export interface DownloadOptions {
  format: 'png' | 'csv' | 'json';
  elementId?: string;
  data?: any[];
  filename: string;
  headers?: string[];
}

/**
 * Universal download function
 */
export const downloadData = async (options: DownloadOptions): Promise<void> => {
  const { format, elementId, data, filename, headers } = options;

  switch (format) {
    case 'png':
      if (!elementId) throw new Error('elementId required for PNG download');
      await downloadChartAsPNG(elementId, filename);
      break;
    case 'csv':
      if (!data) throw new Error('data required for CSV download');
      downloadDataAsCSV(data, filename, headers);
      break;
    case 'json':
      if (!data) throw new Error('data required for JSON download');
      downloadDataAsJSON(data, filename);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
};
