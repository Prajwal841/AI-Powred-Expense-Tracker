import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { createWorker } from 'tesseract.js'
import { 
  Camera, 
  FileText, 
  DollarSign, 
  Calendar, 
  Tag, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X,
  Eye,
  Trash2,
  Plus,
  Edit
} from 'lucide-react'
import { useAppSelector, useAppDispatch } from '../redux/hooks'
import { fetchCategories } from '../redux/slices/categorySlice'
import { addExpense, addExpenseWithReceipt } from '../redux/slices/expenseSlice'
import { fetchReceipts, saveReceipt, deleteReceipt, removeReceipt, updateReceipt, addReceipt, Receipt } from '../redux/slices/receiptSlice'
import { extractDataFromText, ExtractedData, cleanOCRText } from '../utils/ocrUtils'
import { sortCategoriesById } from '../utils/helpers'

const ReceiptScanner = () => {
  const dispatch = useAppDispatch()
  const { categories, loading: categoriesLoading } = useAppSelector((state: any) => state.categories)
  const { receipts, loading } = useAppSelector((state: any) => state.receipts)
  const { user } = useAppSelector((state: any) => state.auth)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    amount: '',
    category: '',
    date: '',
    description: ''
  })

  useEffect(() => {
    dispatch(fetchCategories())
    // Don't fetch receipts from backend since we're not storing them there
    // Receipts are managed in local state only
  }, [dispatch])



  const processReceipt = async (file: File): Promise<Receipt> => {
    // Compress and convert file to base64 for persistent storage
    const base64Image = await new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7) // 70% quality
        resolve(compressedDataUrl)
      }
      
      img.src = URL.createObjectURL(file)
    })
    
    console.log('Starting receipt processing for:', file.name)
    
    // Create initial receipt with processing status
    const initialReceiptData: Omit<Receipt, 'id'> = {
      fileName: file.name,
      imageUrl: base64Image,
      extractedData: { confidence: 0 },
      status: 'processing',
      createdAt: new Date().toISOString(),
      userId: user?.id || ''
    }

    console.log('Creating initial receipt in local state...')
    // Create receipt in local state only (no backend storage)
    const initialReceipt: Receipt = {
      ...initialReceiptData,
      id: Date.now().toString() // Generate local ID
    }
    console.log('Initial receipt created:', initialReceipt)
    
    // Add to local state
    dispatch(addReceipt(initialReceipt))

    try {
      console.log('Starting OCR processing...')
      const worker = await createWorker('eng')
      
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      console.log('OCR text extracted:', text.substring(0, 200) + '...')
      
      const cleanedText = cleanOCRText(text)
      console.log('Cleaned text:', cleanedText.substring(0, 200) + '...')
      
      const extractedData = extractDataFromText(cleanedText)
      console.log('Extracted data:', extractedData)
      
      // Update the existing receipt with completed status and extracted data
      const updatedReceipt: Receipt = {
        ...initialReceipt,
        extractedData,
        status: 'completed'
      }

      console.log('Updating receipt with completed status...')
      // Update in local state only
      dispatch(updateReceipt(updatedReceipt))
      console.log('Receipt updated successfully:', updatedReceipt)
      
      // Automatically open review modal after successful OCR processing
      setTimeout(() => {
        handleReviewReceipt(updatedReceipt)
      }, 500) // Small delay to show completion status
      
      return updatedReceipt

    } catch (error) {
      console.error('OCR processing error:', error)
      
      // Update the existing receipt with error status
      const errorReceipt: Receipt = {
        ...initialReceipt,
        status: 'error'
      }
      
      console.log('Updating receipt with error status...')
      dispatch(updateReceipt(errorReceipt))
      throw error
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true)
    
    try {
      for (const file of acceptedFiles) {
        await processReceipt(file)
      }
    } catch (error) {
      console.error('Error processing receipts:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [user?.id])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff']
    },
    multiple: true
  })

  const handlePreviewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setShowPreviewModal(true)
  }

  const handleReviewReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt)
    setExpenseForm({
      name: receipt.extractedData.merchant || '',
      amount: receipt.extractedData.amount?.toString() || '',
      category: '',
      date: receipt.extractedData.date || new Date().toISOString().split('T')[0],
      description: `Scanned from receipt: ${receipt.fileName}`
    })
    setShowReviewModal(true)
  }

  const handleCreateExpense = async () => {
    if (!user?.id || !selectedReceipt) return

    // Validate required fields
    if (!expenseForm.name || !expenseForm.amount || !expenseForm.category) {
      alert('Please fill in all required fields: Name, Amount, and Category')
      return
    }

    const expenseData = {
      name: expenseForm.name,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      date: expenseForm.date || new Date().toISOString().split('T')[0],
      description: expenseForm.description || `Scanned from receipt: ${selectedReceipt.fileName}`,
      userId: user?.id || ''
    }

    try {
      // Create expense with receipt if we have the receipt image
      if (selectedReceipt.imageUrl && selectedReceipt.imageUrl.startsWith('data:')) {
        // Extract base64 data from data URL
        const base64Data = selectedReceipt.imageUrl
        const fileName = selectedReceipt.fileName || 'receipt.jpg'
        
        // Use the existing expense endpoint with receipt
        await dispatch(addExpenseWithReceipt({
          expense: expenseData,
          base64Receipt: base64Data,
          fileName: fileName
        }))
      } else {
        // Fallback to regular expense creation if no receipt image
        await dispatch(addExpense(expenseData))
      }
      
      // Keep the receipt in the list and close modal if the expense was created successfully
      setShowReviewModal(false)
      setSelectedReceipt(null)
      setExpenseForm({ name: '', amount: '', category: '', date: '', description: '' })
      
      // Update the receipt status to indicate it has been processed
      if (selectedReceipt) {
        dispatch(updateReceipt({
          ...selectedReceipt,
          status: 'processed' // Add a new status to indicate it's been saved
        }))
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      alert(`Error creating expense: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDeleteReceipt = async (receiptId: string) => {
    if (window.confirm('Are you sure you want to delete this receipt?')) {
      // Since we're not storing receipts in the backend, just remove from local state
      dispatch(removeReceipt(receiptId))
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  // Calculate summary statistics
  const totalReceipts = receipts.length
  const completedReceipts = receipts.filter((r: any) => r.status === 'completed').length
  const processedReceipts = receipts.filter((r: any) => r.status === 'processed').length
  const processingReceipts = receipts.filter((r: any) => r.status === 'processing').length
  const errorReceipts = receipts.filter((r: any) => r.status === 'error').length

  const stats = [
    {
      title: 'Total Receipts',
      value: totalReceipts.toString(),
      icon: FileText,
      color: 'bg-primary-100 dark:bg-primary-900',
      iconColor: 'text-primary-600 dark:text-primary-400'
    },
    {
      title: 'Completed',
      value: completedReceipts.toString(),
      icon: CheckCircle,
      color: 'bg-success-100 dark:bg-success-900',
      iconColor: 'text-success-600 dark:text-success-400'
    },
    {
      title: 'Saved',
      value: processedReceipts.toString(),
      icon: CheckCircle,
      color: 'bg-primary-100 dark:bg-primary-900',
      iconColor: 'text-primary-600 dark:text-primary-400'
    },
    {
      title: 'Processing',
      value: processingReceipts.toString(),
      icon: Loader2,
      color: 'bg-warning-100 dark:bg-warning-900',
      iconColor: 'text-warning-600 dark:text-warning-400'
    },
    {
      title: 'Errors',
      value: errorReceipts.toString(),
      icon: AlertCircle,
      color: 'bg-danger-100 dark:bg-danger-900',
      iconColor: 'text-danger-600 dark:text-danger-400'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
             {/* Header */}
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Receipt Scanner</h1>
           <p className="text-gray-600 dark:text-gray-300">Scan and manage your receipts with OCR</p>
         </div>
         <div className="flex space-x-3">
           <button
             {...getRootProps()}
             className="btn-primary flex items-center space-x-2 scan-receipt-button"
             disabled={isProcessing}
           >
             <input {...getInputProps()} />
             {isProcessing ? (
               <Loader2 className="w-4 h-4 animate-spin" />
             ) : (
               <Camera className="w-4 h-4" />
             )}
             <span>{isProcessing ? 'Processing...' : 'Scan Receipt'}</span>
           </button>

         </div>
       </div>

       

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

             {/* Receipts List */}
       <div className="card">
         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Scanned Receipts</h2>
        
        <div className="space-y-4">
          {receipts.length > 0 ? (
            receipts.map((receipt: any, index: number) => (
              <motion.div
                key={receipt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{receipt.fileName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(receipt.createdAt)}
                    </p>
                  </div>
                </div>
                
                                 <div className="flex items-center space-x-4">
                   <div className="text-right">
                     <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                     <div className="flex items-center space-x-2">
                       {receipt.status === 'processing' && (
                         <div className="flex items-center space-x-1 text-warning-600">
                           <Loader2 className="w-4 h-4 animate-spin" />
                           <span className="text-sm">Processing</span>
                         </div>
                       )}
                       {receipt.status === 'completed' && (
                         <div className="flex items-center space-x-1 text-success-600">
                           <CheckCircle className="w-4 h-4" />
                           <span className="text-sm">Completed</span>
                         </div>
                       )}
                       {receipt.status === 'error' && (
                         <div className="flex items-center space-x-1 text-danger-600">
                           <AlertCircle className="w-4 h-4" />
                           <span className="text-sm">Error</span>
                         </div>
                       )}
                       {receipt.status === 'processed' && (
                         <div className="flex items-center space-x-1 text-primary-600">
                           <CheckCircle className="w-4 h-4" />
                           <span className="text-sm">Saved</span>
                         </div>
                       )}
                     </div>
                   </div>
                   
                   {(receipt.status === 'completed' || receipt.status === 'processed') && receipt.extractedData && (
                     <div className="text-right">
                       <p className="text-sm text-gray-600 dark:text-gray-400">Extracted</p>
                       <p className="font-medium text-gray-900 dark:text-white">
                         {receipt.extractedData.amount ? `₹${receipt.extractedData.amount}` : 'N/A'}
                       </p>
                     </div>
                   )}
                   
                   <div className="flex items-center space-x-2">
                     <button
                       onClick={() => handlePreviewReceipt(receipt)}
                       className="p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                       title="Preview Receipt"
                     >
                       <Eye className="w-4 h-4" />
                     </button>
                                           {(receipt.status === 'completed' || receipt.status === 'processed') && (
                        <button
                          onClick={() => handleReviewReceipt(receipt)}
                          className="p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                          title="Edit Receipt"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                     <button
                       onClick={() => handleDeleteReceipt(receipt.id)}
                       className="p-2 text-danger-600 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
                       title="Delete Receipt"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No receipts scanned yet. Start by scanning your first receipt!</p>
            </div>
          )}
        </div>
      </div>

             {/* Preview Modal */}
       <AnimatePresence>
         {showPreviewModal && selectedReceipt && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
             >
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                   Receipt Preview
                 </h2>
                 <button
                   onClick={() => setShowPreviewModal(false)}
                   className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Receipt Image */}
                 <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Receipt Image</h3>
                   <div className="relative">
                     <img
                       src={selectedReceipt.imageUrl}
                       alt={selectedReceipt.fileName}
                       className="w-full h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                     />
                     <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                       {selectedReceipt.extractedData.confidence}% confidence
                     </div>
                   </div>
                 </div>

                 {/* Receipt Details */}
                 <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Receipt Details</h3>
                   
                   <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                         File Name
                       </label>
                       <p className="text-gray-900 dark:text-white">{selectedReceipt.fileName}</p>
                     </div>

                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                         Status
                       </label>
                       <div className="flex items-center space-x-2">
                         {selectedReceipt.status === 'processing' && (
                           <div className="flex items-center space-x-1 text-warning-600">
                             <Loader2 className="w-4 h-4 animate-spin" />
                             <span className="text-sm">Processing</span>
                           </div>
                         )}
                         {selectedReceipt.status === 'completed' && (
                           <div className="flex items-center space-x-1 text-success-600">
                             <CheckCircle className="w-4 h-4" />
                             <span className="text-sm">Completed</span>
                           </div>
                         )}
                         {selectedReceipt.status === 'error' && (
                           <div className="flex items-center space-x-1 text-danger-600">
                             <AlertCircle className="w-4 h-4" />
                             <span className="text-sm">Error</span>
                           </div>
                         )}
                       </div>
                     </div>

                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                         Scanned Date
                       </label>
                       <p className="text-gray-900 dark:text-white">{formatDate(selectedReceipt.createdAt)}</p>
                     </div>

                     {selectedReceipt.status === 'completed' && selectedReceipt.extractedData && (
                       <div className="space-y-3">
                         <h4 className="font-medium text-gray-900 dark:text-white">Extracted Information</h4>
                         
                         {selectedReceipt.extractedData.amount && (
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                               Amount
                             </label>
                             <p className="text-lg font-semibold text-gray-900 dark:text-white">
                               ₹{selectedReceipt.extractedData.amount}
                             </p>
                           </div>
                         )}

                         {selectedReceipt.extractedData.merchant && (
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                               Merchant/Store
                             </label>
                             <p className="text-gray-900 dark:text-white">{selectedReceipt.extractedData.merchant}</p>
                           </div>
                         )}

                         {selectedReceipt.extractedData.date && (
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                               Receipt Date
                             </label>
                             <p className="text-gray-900 dark:text-white">{selectedReceipt.extractedData.date}</p>
                           </div>
                         )}

                         {selectedReceipt.extractedData.tax && (
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                               Tax Amount
                             </label>
                             <p className="text-gray-900 dark:text-white">₹{selectedReceipt.extractedData.tax}</p>
                           </div>
                         )}

                         {selectedReceipt.extractedData.paymentMethod && (
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                               Payment Method
                             </label>
                             <p className="text-gray-900 dark:text-white">{selectedReceipt.extractedData.paymentMethod}</p>
                           </div>
                         )}

                         {selectedReceipt.extractedData.items && selectedReceipt.extractedData.items.length > 0 && (
                           <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                               Items
                             </label>
                             <ul className="space-y-1">
                               {selectedReceipt.extractedData.items.map((item: any, index: number) => (
                                 <li key={index} className="text-sm text-gray-900 dark:text-white">
                                   {item.name} - ₹{item.price}
                                 </li>
                               ))}
                             </ul>
                           </div>
                         )}
                       </div>
                     )}

                                           {selectedReceipt.status === 'completed' && (
                        <div className="pt-4">
                          <button
                            onClick={() => {
                              setShowPreviewModal(false)
                              handleReviewReceipt(selectedReceipt)
                            }}
                            className="btn-secondary w-full"
                          >
                            Edit Receipt
                          </button>
                        </div>
                      )}
                   </div>
                 </div>
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>

       {/* Review & Edit Modal */}
       <AnimatePresence>
         {showReviewModal && selectedReceipt && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
             >
                               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Edit Receipt Data
                  </h2>
                 <button
                   onClick={() => setShowReviewModal(false)}
                   className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Receipt Image */}
                 <div className="space-y-4">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Receipt Image</h3>
                   <div className="relative">
                     {selectedReceipt.imageUrl ? (
                       <img
                         src={selectedReceipt.imageUrl}
                         alt={selectedReceipt.fileName}
                         className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                         onError={(e) => console.error('Image failed to load:', e)}
                         onLoad={() => console.log('Image loaded successfully')}
                       />
                     ) : (
                       <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                         <p className="text-gray-500 dark:text-gray-400">No image available</p>
                       </div>
                     )}
                     <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                       {selectedReceipt.extractedData.confidence}% confidence
                     </div>
                   </div>
                   <div className="text-sm text-gray-600 dark:text-gray-400">
                     <p><strong>File:</strong> {selectedReceipt.fileName}</p>
                     <p><strong>Extracted Data:</strong></p>
                     <ul className="list-disc list-inside space-y-1 mt-2">
                       {selectedReceipt.extractedData.amount && (
                         <li>Amount: ₹{selectedReceipt.extractedData.amount}</li>
                       )}
                       {selectedReceipt.extractedData.merchant && (
                         <li>Merchant: {selectedReceipt.extractedData.merchant}</li>
                       )}
                       {selectedReceipt.extractedData.date && (
                         <li>Date: {selectedReceipt.extractedData.date}</li>
                       )}
                       {selectedReceipt.extractedData.tax && (
                         <li>Tax: ₹{selectedReceipt.extractedData.tax}</li>
                       )}
                       {selectedReceipt.extractedData.paymentMethod && (
                         <li>Payment: {selectedReceipt.extractedData.paymentMethod}</li>
                       )}
                     </ul>
                   </div>
                 </div>

                                   {/* Edit Form */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Receipt Details</h3>
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Expense Name *
                     </label>
                     <input
                       type="text"
                       value={expenseForm.name}
                       onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                       className={`input-field ${!expenseForm.name ? 'border-red-300 focus:border-red-500' : ''}`}
                       placeholder="Enter expense name"
                       required
                     />
                     {!expenseForm.name && (
                       <p className="text-red-500 text-xs mt-1">Please enter an expense name</p>
                     )}
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Amount *
                     </label>
                     <input
                       type="number"
                       step="0.01"
                       value={expenseForm.amount}
                       onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                       className={`input-field ${!expenseForm.amount ? 'border-red-300 focus:border-red-500' : ''}`}
                       placeholder="Enter amount"
                       required
                     />
                     {!expenseForm.amount && (
                       <p className="text-red-500 text-xs mt-1">Please enter an amount</p>
                     )}
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Category *
                     </label>
                     <select
                       value={expenseForm.category}
                       onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                       className={`input-field ${!expenseForm.category ? 'border-red-300 focus:border-red-500' : ''}`}
                       disabled={categoriesLoading}
                       required
                     >
                       <option value="">Select category (required)</option>
                       {categoriesLoading ? (
                         <option value="" disabled>Loading categories...</option>
                       ) : categories && categories.length > 0 ? (
                         sortCategoriesById(categories).map((category: any) => (
                           <option key={category.id} value={category.name}>
                             {category.name}
                           </option>
                         ))
                       ) : (
                         <option value="" disabled>No categories available</option>
                       )}
                     </select>
                     {!expenseForm.category && (
                       <p className="text-red-500 text-xs mt-1">Please select a category</p>
                     )}
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Date *
                     </label>
                     <input
                       type="date"
                       value={expenseForm.date}
                       onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                       className="input-field"
                       required
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Description
                     </label>
                     <textarea
                       value={expenseForm.description}
                       onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                       className="input-field"
                       rows={3}
                       placeholder="Optional description"
                     />
                   </div>

                   <div className="flex space-x-3 pt-4">
                     <button
                       onClick={() => setShowReviewModal(false)}
                       className="btn-secondary flex-1"
                     >
                       Cancel
                     </button>
                                           <button
                        onClick={handleCreateExpense}
                        className="btn-primary flex-1"
                        disabled={!expenseForm.name || !expenseForm.amount || !expenseForm.category}
                      >
                        {!expenseForm.name || !expenseForm.amount || !expenseForm.category 
                          ? 'Fill Required Fields' 
                          : 'Save Changes'
                        }
                      </button>
                   </div>
                 </div>
               </div>
             </motion.div>
           </div>
         )}
       </AnimatePresence>
    </div>
  )
}

export default ReceiptScanner
