import { useState, useEffect } from 'react'
import { Package, Plus, Search, Trash2, Edit2, X, Archive, TrendingUp, TrendingDown, DollarSign, Calendar, Layers, Activity, MinusCircle, BarChart2, Wrench, Users, ArrowUp, ArrowDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import './App.css'

function App() {
  // --- States ---
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('inventory-data')
    return saved ? JSON.parse(saved) : []
  })

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('sales-data')
    return saved ? JSON.parse(saved) : []
  })

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses-data')
    return saved ? JSON.parse(saved) : []
  })

  const [injections, setInjections] = useState(() => {
    const saved = localStorage.getItem('injections-data')
    return saved ? JSON.parse(saved) : []
  })
  
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard', 'materia-prima', 'producto-terminado', 'graficos', 'vendedores'
  const [searchTerm, setSearchTerm] = useState('')
  const [chartTimeframe, setChartTimeframe] = useState('dia') // 'dia', 'mes', 'año'
  
  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isInjectionModalOpen, setIsInjectionModalOpen] = useState(false)
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [productFormData, setProductFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    category: '',
    type: 'producto-terminado', // 'materia-prima' | 'producto-terminado'
    unit: 'unidad',
    recipe: {}
  })

  const [saleFormData, setSaleFormData] = useState({
    productId: '',
    quantity: '',
    seller: ''
  })

  const [productionFormData, setProductionFormData] = useState({
    productId: '',
    quantityProduced: '',
    materialsUsed: {} // { id: amount }
  })

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('inventory-data', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('sales-data', JSON.stringify(sales))
  }, [sales])

  useEffect(() => {
    localStorage.setItem('expenses-data', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('injections-data', JSON.stringify(injections))
  }, [injections])

  // --- Handlers ---
  const handleProductInputChange = (e) => {
    const { name, value } = e.target
    setProductFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaleInputChange = (e) => {
    const { name, value } = e.target
    setSaleFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target
    setExpenseFormData(prev => ({ ...prev, [name]: value }))
  }

  // Product Modal
  const openProductModal = (product = null) => {
    if (product) {
      setProductFormData({ ...product, unit: product.unit || 'unidad', recipe: product.recipe || {} })
      setEditingId(product.id)
    } else {
      setProductFormData({ name: '', quantity: '', price: '', category: '', type: activeTab === 'materia-prima' ? 'materia-prima' : 'producto-terminado', unit: 'unidad', recipe: {} })
      setEditingId(null)
    }
    setIsProductModalOpen(true)
  }

  const closeProductModal = () => setIsProductModalOpen(false)

  const handleProductSubmit = (e) => {
    e.preventDefault()
    
    const productDataToSave = {
      ...productFormData,
      quantity: productFormData.quantity || 0
    }

    if (editingId) {
      const oldProduct = products.find(p => p.id === editingId)
      const oldQuantity = oldProduct ? Number(oldProduct.quantity) : 0
      const newQuantity = Number(productDataToSave.quantity)
      const addedQuantity = newQuantity - oldQuantity

      setProducts(products.map(p => 
        p.id === editingId ? { ...productDataToSave, id: editingId } : p
      ))

      if (productDataToSave.type === 'materia-prima' && addedQuantity > 0) {
        const cost = addedQuantity * Number(productDataToSave.price)
        if (cost > 0) {
          const newExpense = {
            id: crypto.randomUUID(),
            description: `Reabastecimiento: ${productDataToSave.name} (+${addedQuantity})`,
            amount: cost,
            date: new Date().toISOString()
          }
          setExpenses([...expenses, newExpense])
        }
      }
    } else {
      const newProduct = {
        ...productDataToSave,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString()
      }
      setProducts([...products, newProduct])

      if (productDataToSave.type === 'materia-prima') {
        const cost = Number(productDataToSave.quantity) * Number(productDataToSave.price)
        if (cost > 0) {
          const newExpense = {
            id: crypto.randomUUID(),
            description: `Compra de materia prima: ${productDataToSave.name}`,
            amount: cost,
            date: new Date().toISOString()
          }
          setExpenses([...expenses, newExpense])
        }
      }
    }
    closeProductModal()
  }

  const deleteProduct = (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const moveProduct = (id, direction) => {
    const productIndex = products.findIndex(p => p.id === id)
    if (productIndex === -1) return

    const product = products[productIndex]
    
    // Find the adjacent product of the SAME TYPE in the specified direction
    const sameTypeProducts = products.filter(p => p.type === product.type)
    const sameTypeIndex = sameTypeProducts.findIndex(p => p.id === id)
    
    if (direction === 'up' && sameTypeIndex > 0) {
      const adjacentProduct = sameTypeProducts[sameTypeIndex - 1]
      const adjacentIndex = products.findIndex(p => p.id === adjacentProduct.id)
      
      const newProducts = [...products]
      newProducts[productIndex] = newProducts[adjacentIndex]
      newProducts[adjacentIndex] = product
      setProducts(newProducts)
    } else if (direction === 'down' && sameTypeIndex < sameTypeProducts.length - 1) {
      const adjacentProduct = sameTypeProducts[sameTypeIndex + 1]
      const adjacentIndex = products.findIndex(p => p.id === adjacentProduct.id)
      
      const newProducts = [...products]
      newProducts[productIndex] = newProducts[adjacentIndex]
      newProducts[adjacentIndex] = product
      setProducts(newProducts)
    }
  }

  // Sale Modal
  const openSaleModal = () => {
    setSaleFormData({ productId: '', quantity: '', seller: '' })
    setIsSaleModalOpen(true)
  }

  const closeSaleModal = () => setIsSaleModalOpen(false)

  const handleSaleSubmit = (e) => {
    e.preventDefault()
    const product = products.find(p => p.id === saleFormData.productId)
    if (!product) return

    const saleQuantity = Number(saleFormData.quantity)
    if (saleQuantity > Number(product.quantity)) {
      alert('Error: La cantidad a vender supera el stock disponible.')
      return
    }

    // Deduct stock
    setProducts(products.map(p => 
      p.id === product.id 
        ? { ...p, quantity: Number(p.quantity) - saleQuantity } 
        : p
    ))

    // Record sale
    const totalSale = saleQuantity * Number(product.price)
    const commission = totalSale * 0.05
    const newSale = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      quantity: saleQuantity,
      unitPrice: Number(product.price),
      total: totalSale,
      seller: saleFormData.seller || 'Sin vendedor',
      commission: commission,
      date: new Date().toISOString()
    }
    setSales([...sales, newSale])
    closeSaleModal()
  }

  // Expense Modal
  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    amount: ''
  })

  const openExpenseModal = () => {
    setExpenseFormData({ description: '', amount: '' })
    setIsExpenseModalOpen(true)
  }

  const closeExpenseModal = () => setIsExpenseModalOpen(false)

  const handleExpenseSubmit = (e) => {
    e.preventDefault()
    const newExpense = {
      id: crypto.randomUUID(),
      description: expenseFormData.description,
      amount: Number(expenseFormData.amount),
      date: new Date().toISOString()
    }
    setExpenses([...expenses, newExpense])
    closeExpenseModal()
  }

  // Injection Modal
  const [injectionFormData, setInjectionFormData] = useState({
    description: 'Inyección de Capital',
    amount: ''
  })

  const openInjectionModal = () => {
    setInjectionFormData({ description: 'Inyección de Capital', amount: '' })
    setIsInjectionModalOpen(true)
  }

  const closeInjectionModal = () => setIsInjectionModalOpen(false)

  const handleInjectionSubmit = (e) => {
    e.preventDefault()
    const newInjection = {
      id: crypto.randomUUID(),
      description: injectionFormData.description || 'Inyección de Capital',
      amount: Number(injectionFormData.amount),
      date: new Date().toISOString()
    }
    setInjections([...injections, newInjection])
    closeInjectionModal()
  }

  const handleInjectionInputChange = (e) => {
    const { name, value } = e.target
    setInjectionFormData(prev => ({ ...prev, [name]: value }))
  }

  // Production Modal
  const openProductionModal = () => {
    setProductionFormData({ productId: '', quantityProduced: '', materialsUsed: {} })
    setIsProductionModalOpen(true)
  }

  const closeProductionModal = () => setIsProductionModalOpen(false)

  const handleProductionMaterialChange = (materialId, value) => {
    setProductionFormData(prev => ({
      ...prev,
      materialsUsed: { ...prev.materialsUsed, [materialId]: value }
    }))
  }

  const handleProductionSubmit = (e) => {
    e.preventDefault()
    const product = products.find(p => p.id === productionFormData.productId)
    if (!product) return

    const qtyProduced = Number(productionFormData.quantityProduced)
    
    // Check if enough materials are available
    for (const [matId, amount] of Object.entries(productionFormData.materialsUsed)) {
      if (amount > 0) {
        const mat = products.find(p => p.id === matId)
        if (!mat || Number(mat.quantity) < Number(amount)) {
          alert(`Error: No tienes suficiente stock de materia prima: ${mat?.name || 'Desconocida'}. Necesitas ${amount} pero tienes ${mat?.quantity || 0}.`)
          return
        }
      }
    }

    // Update Products (Increase finished product, decrease raw materials)
    const updatedProducts = products.map(p => {
      // Increase finished product
      if (p.id === product.id) {
        return { ...p, quantity: Number(p.quantity) + qtyProduced }
      }
      // Decrease raw materials used
      if (productionFormData.materialsUsed[p.id] > 0) {
        return { ...p, quantity: Number(p.quantity) - Number(productionFormData.materialsUsed[p.id]) }
      }
      return p
    })

    setProducts(updatedProducts)
    closeProductionModal()
  }

  // --- Derived Data & Calculations ---
  const rawMaterials = products.filter(p => p.type === 'materia-prima')
  const finishedProducts = products.filter(p => p.type === 'producto-terminado')

  const getFilteredProducts = (list) => {
    return list.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Sales calculations
  const today = new Date()
  today.setHours(0,0,0,0)

  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const salesToday = sales.filter(s => new Date(s.date) >= today)
  const salesThisWeek = sales.filter(s => new Date(s.date) >= oneWeekAgo)

  const revenueToday = salesToday.reduce((acc, s) => acc + s.total, 0)
  const revenueThisWeek = salesThisWeek.reduce((acc, s) => acc + s.total, 0)
  const totalInventoryValue = products.reduce((acc, p) => acc + (Number(p.quantity) * Number(p.price)), 0)

  const totalRevenueAllTime = sales.reduce((acc, s) => acc + s.total, 0)
  const totalExpensesAllTime = expenses.reduce((acc, e) => acc + e.amount, 0)
  const totalCommissionsAllTime = sales.reduce((acc, s) => acc + (s.commission || 0), 0)
  const totalInjectionsAllTime = injections.reduce((acc, i) => acc + i.amount, 0)
  const netProfit = totalRevenueAllTime - totalExpensesAllTime - totalCommissionsAllTime
  const cashBalance = totalInjectionsAllTime + netProfit

  const getMotivationalAdvice = (profit) => {
    if (profit < 0) {
      return "Cada gran empresa ha pasado por momentos difíciles. Las pérdidas de hoy son el aprendizaje para las ganancias de mañana. ¡No te rindas, sigue adelante!"
    } else {
      return "¡Excelente trabajo! Estás en números verdes, pero recuerda: este no es tu límite. Sigue innovando y expandiendo, ¡puedes crecer mucho más!"
    }
  }

  const getChartData = () => {
    const dataMap = {}
    
    const processItem = (item, isExpense) => {
      const d = new Date(item.date)
      let key = ''
      if (chartTimeframe === 'dia') {
        key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
      } else if (chartTimeframe === 'mes') {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        key = `${months[d.getMonth()]} ${d.getFullYear()}`
      } else if (chartTimeframe === 'año') {
        key = `${d.getFullYear()}`
      }

      if (!dataMap[key]) {
        dataMap[key] = { name: key, Ventas: 0, Gastos: 0, Beneficio: 0, time: d.getTime() }
      }
      
      if (isExpense) {
        dataMap[key].Gastos += item.amount || 0
      } else {
        dataMap[key].Ventas += item.total || 0
        dataMap[key].Gastos += item.commission || 0
      }
      // Actualizar Beneficio
      dataMap[key].Beneficio = dataMap[key].Ventas - dataMap[key].Gastos
    }

    sales.forEach(s => processItem(s, false))
    expenses.forEach(e => processItem(e, true))

    return Object.values(dataMap).sort((a, b) => a.time - b.time)
  }

  const chartData = getChartData()

  // --- Render Helpers ---
  const renderProductTable = (title, productList, emptyMessage) => {
    const filtered = getFilteredProducts(productList)
    
    return (
      <div className="fade-in">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <div className="flex items-center" style={{ gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="form-input" 
                style={{ paddingLeft: '2.5rem', width: '250px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => openProductModal()}>
              <Plus size={18} />
              <span>Agregar</span>
            </button>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th className="text-right">Precio Unit.</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, index) => (
                  <tr key={product.id}>
                    <td className="font-medium">{product.name}</td>
                    <td><span className="badge badge-neutral">{product.category || 'Sin categoría'}</span></td>
                    <td className="text-right">S/ {Number(product.price).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                    <td className="text-right">
                      {product.quantity} {product.type === 'materia-prima' && product.unit ? (product.unit === 'unidad' ? 'unids.' : product.unit) : ''}
                    </td>
                    <td className="text-right">
                      {Number(product.quantity) <= 3 ? (
                        <span className="badge badge-neutral" style={{ backgroundColor: '#fef2f2', color: 'var(--danger-color)', fontWeight: 'bold' }}>
                          ⚠️ Urgente: {product.type === 'materia-prima' ? 'Comprar' : 'Hacer más'}
                        </span>
                      ) : (
                        <span className="badge badge-success">En Stock</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end" style={{ gap: '0.5rem' }}>
                        {!searchTerm && (
                          <>
                            <button className="btn btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent', opacity: index === 0 ? 0.3 : 1 }} onClick={() => moveProduct(product.id, 'up')} disabled={index === 0} title="Mover Arriba">
                              <ArrowUp size={16} color="var(--text-secondary)" />
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent', opacity: index === filtered.length - 1 ? 0.3 : 1 }} onClick={() => moveProduct(product.id, 'down')} disabled={index === filtered.length - 1} title="Mover Abajo">
                              <ArrowDown size={16} color="var(--text-secondary)" />
                            </button>
                          </>
                        )}
                        <button className="btn btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent' }} onClick={() => openProductModal(product)}>
                          <Edit2 size={16} color="var(--text-secondary)" />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '0.4rem', background: 'transparent' }} onClick={() => deleteProduct(product.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Package size={48} className="empty-icon" />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{emptyMessage}</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'No hay registros en esta sección aún.'}
            </p>
            {!searchTerm && (
              <button className="btn btn-primary" onClick={() => openProductModal()}>
                <Plus size={18} />
                <span>Agregar el primero</span>
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="container header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="logo">
              <span className="logo-main">Soleh</span>
              <span className="logo-sub">Saludable para ti</span>
            </div>
            <button 
              className="btn btn-danger" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              onClick={() => {
                if (window.confirm('¿Estás seguro de reiniciar la caja? Esto borrará el historial de Ventas y Gastos, pero mantendrá tu Inventario. Esta acción no se puede deshacer.')) {
                  setSales([])
                  setExpenses([])
                  setInjections([])
                }
              }}
            >
              Reiniciar Caja
            </button>
          </div>
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Activity size={18} /> Resumen y Ventas
            </button>
            <button 
              className={`nav-tab ${activeTab === 'materia-prima' ? 'active' : ''}`}
              onClick={() => setActiveTab('materia-prima')}
            >
              <Layers size={18} /> Materia Prima
            </button>
            <button 
              className={`nav-tab ${activeTab === 'producto-terminado' ? 'active' : ''}`}
              onClick={() => setActiveTab('producto-terminado')}
            >
              <Package size={18} /> Productos Terminados
            </button>
            <button 
              className={`nav-tab ${activeTab === 'graficos' ? 'active' : ''}`}
              onClick={() => setActiveTab('graficos')}
            >
              <BarChart2 size={18} /> Gráficos de Progreso
            </button>
            <button 
              className={`nav-tab ${activeTab === 'vendedores' ? 'active' : ''}`}
              onClick={() => setActiveTab('vendedores')}
            >
              <Users size={18} /> Vendedores
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content container">
        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
               <h2 className="section-title">Vista General</h2>
               <div className="flex" style={{ gap: '1rem' }}>
                 <button className="btn btn-secondary" onClick={openInjectionModal} style={{ borderColor: 'var(--success-color)', color: 'var(--success-color)' }}>
                    <DollarSign size={18} />
                    <span>Inyectar Capital</span>
                 </button>
                 <button className="btn btn-secondary" onClick={openExpenseModal} style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>
                    <MinusCircle size={18} />
                    <span>Registrar Gasto</span>
                 </button>
                 <button className="btn btn-primary" onClick={openProductionModal} style={{ backgroundColor: 'var(--accent-color)' }}>
                    <Wrench size={18} />
                    <span>Producir</span>
                 </button>
                 <button className="btn btn-primary" onClick={openSaleModal}>
                    <DollarSign size={18} />
                    <span>Registrar Venta</span>
                 </button>
               </div>
            </div>

            {/* Stats Row */}
            <div className="stats-grid" style={{ marginBottom: '3rem' }}>
              <div className="stat-card" style={{ borderLeft: '4px solid var(--success-color)' }}>
                <div className="stat-icon" style={{ backgroundColor: '#eff4ec', color: 'var(--success-color)' }}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="stat-label">Saldo Total en Caja</p>
                  <h3 className="stat-value">S/ {cashBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="stat-label">Ventas Hoy</p>
                  <h3 className="stat-value">S/ {revenueToday.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#eff4ec', color: 'var(--success-color)' }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="stat-label">Ventas (7 Días)</p>
                  <h3 className="stat-value">S/ {revenueThisWeek.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#f4f4f5', color: 'var(--text-primary)' }}>
                  <Archive size={24} />
                </div>
                <div>
                  <p className="stat-label">Valor del Inventario</p>
                  <h3 className="stat-value">S/ {totalInventoryValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</h3>
                </div>
              </div>
            </div>

            {/* Profit/Loss Advice Box */}
            <div className="stat-card" style={{ marginBottom: '3rem', borderLeft: `4px solid ${netProfit >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}` }}>
              <div className="stat-icon" style={{ backgroundColor: netProfit >= 0 ? '#eff4ec' : '#fef2f2', color: netProfit >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                {netProfit >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
              <div style={{ flex: 1 }}>
                <p className="stat-label">Beneficio Neto (Ingresos vs Gastos)</p>
                <h3 className="stat-value" style={{ color: netProfit >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                  S/ {netProfit.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </h3>
                <div style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: netProfit >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '0.5rem', border: `1px solid ${netProfit >= 0 ? '#bbf7d0' : '#fecaca'}` }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: netProfit >= 0 ? '#166534' : '#991b1b', lineHeight: '1.5' }}>
                    <strong>💡 Consejo:</strong> {getMotivationalAdvice(netProfit)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tablas de Ventas y Gastos */}
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
              <div>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                  <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Últimas Ventas</h3>
                  <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem', fontWeight: 'bold' }}>Total: S/ {totalRevenueAllTime.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                </div>
                {sales.length > 0 ? (
                   <div className="table-container">
                     <table className="table">
                       <thead>
                         <tr>
                           <th>Fecha</th>
                           <th>Producto</th>
                           <th>Vendedor</th>
                           <th className="text-right">Comisión (5%)</th>
                           <th className="text-right">Total</th>
                         </tr>
                       </thead>
                       <tbody>
                         {[...sales].reverse().slice(0, 10).map(sale => (
                           <tr key={sale.id}>
                             <td>{new Date(sale.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
                             <td className="font-medium">{sale.productName}</td>
                             <td>{sale.seller || 'N/A'}</td>
                             <td className="text-right" style={{ color: 'var(--accent-color)' }}>
                               S/ {(sale.commission || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                             </td>
                             <td className="text-right font-medium text-success">+S/ {sale.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                ) : (
                   <div className="empty-state" style={{ padding: '2rem' }}>
                      <p>Aún no has registrado ninguna venta.</p>
                   </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                  <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Últimos Gastos Registrados</h3>
                  <span className="badge badge-neutral" style={{ backgroundColor: '#fef2f2', color: 'var(--danger-color)', fontSize: '0.9rem', padding: '0.4rem 0.8rem', fontWeight: 'bold' }}>Total: S/ {totalExpensesAllTime.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                </div>
                {expenses.length > 0 ? (
                   <div className="table-container">
                     <table className="table">
                       <thead>
                         <tr>
                           <th>Fecha</th>
                           <th>Descripción</th>
                           <th className="text-right">Monto</th>
                         </tr>
                       </thead>
                       <tbody>
                         {[...expenses].reverse().slice(0, 10).map(expense => (
                           <tr key={expense.id}>
                             <td>{new Date(expense.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
                             <td className="font-medium">{expense.description}</td>
                             <td className="text-right font-medium" style={{ color: 'var(--danger-color)' }}>-S/ {expense.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                ) : (
                   <div className="empty-state" style={{ padding: '2rem' }}>
                      <p>Aún no has registrado ningún gasto o pérdida.</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'materia-prima' && renderProductTable('Inventario: Materia Prima', rawMaterials, 'No hay materia prima')}
        {activeTab === 'producto-terminado' && renderProductTable('Inventario: Productos Terminados', finishedProducts, 'No hay productos terminados')}

        {activeTab === 'graficos' && (
          <div className="fade-in">
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
               <h2 className="section-title">Mapa de Progreso</h2>
               <div className="flex" style={{ gap: '0.5rem' }}>
                 <button className={`btn ${chartTimeframe === 'dia' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChartTimeframe('dia')}>Día</button>
                 <button className={`btn ${chartTimeframe === 'mes' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChartTimeframe('mes')}>Mes</button>
                 <button className={`btn ${chartTimeframe === 'año' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChartTimeframe('año')}>Año</button>
               </div>
            </div>

            <div className="stat-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>Relación de Ingresos y Egresos</h3>
              
              {chartData.length > 0 ? (
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        formatter={(value) => [`S/ ${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, '']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                      />
                      <Legend />
                      <Bar dataKey="Ventas" fill="var(--success-color)" radius={[4, 4, 0, 0]} name="Ingresos (Ventas)" />
                      <Bar dataKey="Gastos" fill="var(--danger-color)" radius={[4, 4, 0, 0]} name="Gastos/Pérdidas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                   <BarChart2 size={48} className="empty-icon" />
                   <h3>No hay datos para graficar</h3>
                   <p>Registra ventas y gastos para visualizar tu progreso aquí.</p>
                </div>
              )}
            </div>

            {chartData.length > 0 && (
              <div className="stat-card" style={{ marginTop: '2rem', padding: '2rem' }}>
                <h3 style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>Evolución del Beneficio Neto</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        formatter={(value) => [`S/ ${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 'Beneficio Neto']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="Beneficio" stroke="var(--accent-color)" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vendedores' && (
          <div className="fade-in">
             <div className="section-header">
               <h2 className="section-title">Rendimiento de Vendedores</h2>
             </div>
             {(() => {
                const sellersMap = {};
                sales.forEach(s => {
                  const sellerName = s.seller || 'N/A';
                  if (!sellersMap[sellerName]) {
                    sellersMap[sellerName] = { name: sellerName, totalSales: 0, totalCommission: 0, salesCount: 0 };
                  }
                  sellersMap[sellerName].totalSales += s.total;
                  sellersMap[sellerName].totalCommission += s.commission || 0;
                  sellersMap[sellerName].salesCount += 1;
                });
                const sellersList = Object.values(sellersMap);

                return sellersList.length > 0 ? (
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {sellersList.map(seller => (
                      <div key={seller.name} className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                           <div className="stat-icon" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent-color)' }}>
                             <Users size={24} />
                           </div>
                           <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{seller.name}</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                           <div className="flex justify-between">
                             <span className="text-secondary">Ventas Totales:</span>
                             <span className="font-medium text-success">+S/ {seller.totalSales.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-secondary">Comisión Acumulada:</span>
                             <span className="font-medium" style={{ color: 'var(--accent-color)' }}>S/ {seller.totalCommission.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</span>
                           </div>
                           <div className="flex justify-between">
                             <span className="text-secondary">N° de Ventas:</span>
                             <span className="font-medium">{seller.salesCount}</span>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Users size={48} className="empty-icon" />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No hay datos de vendedores</h3>
                    <p>Las ventas registradas con un vendedor asignado aparecerán aquí.</p>
                  </div>
                );
             })()}
          </div>
        )}

      </main>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={closeProductModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Editar Item' : 'Nuevo Item'}</h3>
              <button className="modal-close" onClick={closeProductModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleProductSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Tipo de Registro *</label>
                <div className="radio-group">
                  <label className={`radio-label ${productFormData.type === 'materia-prima' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="materia-prima"
                      checked={productFormData.type === 'materia-prima'}
                      onChange={handleProductInputChange}
                    /> Materia Prima
                  </label>
                  <label className={`radio-label ${productFormData.type === 'producto-terminado' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="producto-terminado"
                      checked={productFormData.type === 'producto-terminado'}
                      onChange={handleProductInputChange}
                    /> Producto Terminado
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-input" 
                  required
                  value={productFormData.name}
                  onChange={handleProductInputChange}
                  placeholder="Ej. Madera de Roble / Mesa de Centro"
                />
              </div>
              
              <div className="flex" style={{ gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Cantidad</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      name="quantity" 
                      className="form-input" 
                      min="0"
                      style={{ flex: productFormData.type === 'materia-prima' ? 2 : 1 }}
                      value={productFormData.quantity}
                      onChange={handleProductInputChange}
                      placeholder="0"
                    />
                    {productFormData.type === 'materia-prima' && (
                      <select 
                        name="unit" 
                        className="form-input" 
                        style={{ flex: 1, padding: '0.625rem 0.2rem' }}
                        value={productFormData.unit || 'unidad'}
                        onChange={handleProductInputChange}
                      >
                        <option value="unidad">Unid.</option>
                        <option value="kilos">Kilos</option>
                        <option value="gramos">Gramos</option>
                      </select>
                    )}
                  </div>
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Precio Unitario *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>S/</span>
                    <input 
                      type="number" 
                      name="price" 
                      className="form-input" 
                      required
                      min="0"
                      step="0.01"
                      style={{ paddingLeft: '1.75rem' }}
                      value={productFormData.price}
                      onChange={handleProductInputChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <input 
                  type="text" 
                  name="category" 
                  className="form-input" 
                  value={productFormData.category}
                  onChange={handleProductInputChange}
                  placeholder="Opcional"
                />
              </div>

              {productFormData.type === 'producto-terminado' && (
                <div className="form-group" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-md)' }}>
                  <label className="form-label">Receta (Materias primas por 1 unidad)</label>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Indica cuánto de cada materia prima se necesita para hacer 1 unidad. Se usará para autocompletar al producir.
                  </p>
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {rawMaterials.length > 0 ? rawMaterials.map(mat => (
                      <div key={mat.id} className="flex justify-between items-center" style={{ marginBottom: '0.5rem', gap: '1rem' }}>
                        <span style={{ fontSize: '0.9rem', flex: 1 }}>{mat.name} <span style={{ color: 'var(--text-tertiary)' }}>({mat.unit || 'unidad'})</span></span>
                        <input 
                          type="number" 
                          className="form-input" 
                          min="0"
                          step="0.01"
                          style={{ width: '100px', padding: '0.4rem' }}
                          value={productFormData.recipe?.[mat.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setProductFormData(prev => ({
                              ...prev,
                              recipe: { ...(prev.recipe || {}), [mat.id]: val }
                            }))
                          }}
                          placeholder="0"
                        />
                      </div>
                    )) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>No hay materias primas registradas.</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeProductModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sale Modal */}
      {isSaleModalOpen && (
        <div className="modal-overlay" onClick={closeSaleModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Registrar Venta</h3>
              <button className="modal-close" onClick={closeSaleModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaleSubmit}>
              <div className="form-group">
                <label className="form-label">Producto Vendido *</label>
                <select 
                  name="productId" 
                  className="form-input"
                  required
                  value={saleFormData.productId}
                  onChange={handleSaleInputChange}
                >
                  <option value="">-- Seleccionar Producto --</option>
                  {finishedProducts.map(p => (
                    <option key={p.id} value={p.id} disabled={Number(p.quantity) === 0}>
                      {p.name} (Stock: {p.quantity}) - S/ {p.price}
                    </option>
                  ))}
                </select>
                {finishedProducts.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '0.25rem' }}>
                    No tienes productos terminados registrados.
                  </p>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Cantidad Vendida *</label>
                <input 
                  type="number" 
                  name="quantity" 
                  className="form-input" 
                  required
                  min="1"
                  value={saleFormData.quantity}
                  onChange={handleSaleInputChange}
                  placeholder="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vendedor *</label>
                <select 
                  name="seller" 
                  className="form-input"
                  required
                  value={saleFormData.seller}
                  onChange={handleSaleInputChange}
                >
                  <option value="">-- Seleccionar Vendedor --</option>
                  <option value="Elmer">Elmer</option>
                  <option value="Delia">Delia</option>
                  <option value="Sol">Sol</option>
                </select>
              </div>

              {/* Preview Total */}
              {saleFormData.productId && saleFormData.quantity && (
                 <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ fontWeight: 500 }}>Total Estimado:</span>
                       <span style={{ fontWeight: 600, color: 'var(--success-color)' }}>
                          S/ { (products.find(p => p.id === saleFormData.productId)?.price * Number(saleFormData.quantity) || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 }) }
                       </span>
                    </div>
                    {saleFormData.seller && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                         <span style={{ fontWeight: 500 }}>Comisión (5%):</span>
                         <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>
                            S/ { ((products.find(p => p.id === saleFormData.productId)?.price * Number(saleFormData.quantity) || 0) * 0.05).toLocaleString('es-ES', { minimumFractionDigits: 2 }) }
                         </span>
                      </div>
                    )}
                 </div>
              )}
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeSaleModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={!saleFormData.productId || !saleFormData.quantity || !saleFormData.seller}>
                  Confirmar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="modal-overlay" onClick={closeExpenseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Registrar Gasto o Pérdida</h3>
              <button className="modal-close" onClick={closeExpenseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleExpenseSubmit}>
              <div className="form-group">
                <label className="form-label">Descripción del Gasto *</label>
                <input 
                  type="text" 
                  name="description" 
                  className="form-input" 
                  required
                  value={expenseFormData.description}
                  onChange={handleExpenseInputChange}
                  placeholder="Ej. Compra de empaques, servicio eléctrico..."
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Monto (S/) *</label>
                <input 
                  type="number" 
                  name="amount" 
                  className="form-input" 
                  required
                  min="0.01"
                  step="0.01"
                  value={expenseFormData.amount}
                  onChange={handleExpenseInputChange}
                  placeholder="0.00"
                />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeExpenseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--danger-color)' }} disabled={!expenseFormData.description || !expenseFormData.amount}>
                  Confirmar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Injection Modal */}
      {isInjectionModalOpen && (
        <div className="modal-overlay" onClick={closeInjectionModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Inyectar Capital / Saldo Base</h3>
              <button className="modal-close" onClick={closeInjectionModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleInjectionSubmit}>
              <div className="form-group">
                <label className="form-label">Descripción *</label>
                <input 
                  type="text" 
                  name="description" 
                  className="form-input" 
                  required
                  value={injectionFormData.description}
                  onChange={handleInjectionInputChange}
                  placeholder="Ej. Saldo inicial, Inyección de socios..."
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Monto (S/) *</label>
                <input 
                  type="number" 
                  name="amount" 
                  className="form-input" 
                  required
                  min="0.01"
                  step="0.01"
                  value={injectionFormData.amount}
                  onChange={handleInjectionInputChange}
                  placeholder="0.00"
                />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeInjectionModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--success-color)' }} disabled={!injectionFormData.description || !injectionFormData.amount}>
                  Añadir Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Production Modal */}
      {isProductionModalOpen && (
        <div className="modal-overlay" onClick={closeProductionModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Fabricar Producto Terminado</h3>
              <button className="modal-close" onClick={closeProductionModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleProductionSubmit}>
              <div className="form-group">
                <label className="form-label">Producto a Fabricar *</label>
                <select 
                  name="productId" 
                  className="form-input"
                  required
                  value={productionFormData.productId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const prod = products.find(p => p.id === selectedId);
                    const qty = Number(productionFormData.quantityProduced) || 0;
                    const newMaterialsUsed = {};
                    if (prod && prod.recipe) {
                      Object.entries(prod.recipe).forEach(([matId, amountPerUnit]) => {
                        if (amountPerUnit > 0) newMaterialsUsed[matId] = Number((Number(amountPerUnit) * qty).toFixed(2));
                      });
                    }
                    setProductionFormData(prev => ({ ...prev, productId: selectedId, materialsUsed: newMaterialsUsed }));
                  }}
                >
                  <option value="">-- Seleccionar Producto --</option>
                  {finishedProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock actual: {p.quantity})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Cantidad Creada (Unidades) *</label>
                <input 
                  type="number" 
                  name="quantityProduced" 
                  className="form-input" 
                  required
                  min="1"
                  value={productionFormData.quantityProduced}
                  onChange={(e) => {
                    const qty = e.target.value;
                    const prod = products.find(p => p.id === productionFormData.productId);
                    const newMaterialsUsed = { ...productionFormData.materialsUsed };
                    if (prod && prod.recipe) {
                      Object.entries(prod.recipe).forEach(([matId, amountPerUnit]) => {
                        if (amountPerUnit > 0) newMaterialsUsed[matId] = Number((Number(amountPerUnit) * Number(qty || 0)).toFixed(2));
                      });
                    }
                    setProductionFormData(prev => ({ ...prev, quantityProduced: qty, materialsUsed: newMaterialsUsed }));
                  }}
                  placeholder="Ej. 4"
                />
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Materias Primas Utilizadas (Descargo de Inventario)</label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Ingresa cuánto consumiste de cada materia prima. El sistema lo descontará automáticamente de tu stock. Deja en 0 lo que no utilizaste.
                </p>
                <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius-md)' }}>
                  {rawMaterials.length > 0 ? rawMaterials.map(mat => (
                    <div key={mat.id} className="flex justify-between items-center" style={{ marginBottom: '0.75rem', gap: '1rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, flex: 1 }}>{mat.name} <span style={{ color: 'var(--text-tertiary)' }}>(Disp: {mat.quantity})</span></span>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0"
                        step="0.01"
                        style={{ width: '120px' }}
                        value={productionFormData.materialsUsed[mat.id] || ''}
                        onChange={(e) => handleProductionMaterialChange(mat.id, e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--danger-color)' }}>No hay materias primas registradas.</p>
                  )}
                </div>
              </div>
              
              <div className="modal-footer" style={{ marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeProductionModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={!productionFormData.productId || !productionFormData.quantityProduced}>
                  Registrar Producción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
