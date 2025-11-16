// Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '') {
        initUserPage();
    } else if (currentPage === 'it-dashboard.html') {
        initITDashboard();
    } else if (currentPage === 'report.html') {
        initReportPage();
    }
    
    // Common initialization for all pages
    initCommonFeatures();
});

// Initialize common features for all pages
function initCommonFeatures() {
    // Dark mode toggle is handled in darkmode.js
    
    // Role switching
    const switchToITButton = document.getElementById('switchToIT');
    if (switchToITButton) {
        switchToITButton.addEventListener('click', function() {
            window.location.href = 'it-dashboard.html';
        });
    }
    
    // Modal animations
    const modals = document.querySelectorAll('.fixed.inset-0');
    modals.forEach(modal => {
        if (modal.classList.contains('hidden')) {
            modal.style.opacity = '0';
        }
    });
}

// Initialize User Page
function initUserPage() {
    const ticketForm = document.getElementById('ticketForm');
    const refreshTicketsButton = document.getElementById('refreshTickets');
    const successModal = document.getElementById('successModal');
    const closeModalButton = document.getElementById('closeModal');
    const ticketNumberSpan = document.getElementById('ticketNumber');
    
    // Load user's ticket history
    loadUserTickets();
    
    // Handle form submission
    if (ticketForm) {
        ticketForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(ticketForm);
            const ticketData = {
                nama: formData.get('nama'),
                email: formData.get('email'),
                divisi: formData.get('divisi'),
                kategori: formData.get('kategori'),
                urgensi: formData.get('urgensi'),
                deskripsi: formData.get('deskripsi'),
                file: formData.get('file') ? formData.get('file').name : null
            };
            
            // Validate form
            if (!validateTicketForm(ticketData)) {
                return;
            }
            
            // Submit ticket
            try {
                const result = await AppScriptAPI.createTicket(ticketData);
                
                if (result.success) {
                    // Show success modal
                    ticketNumberSpan.textContent = result.ticket.id;
                    showModal(successModal);
                    
                    // Reset form
                    ticketForm.reset();
                    
                    // Refresh ticket history
                    loadUserTickets();
                } else {
                    alert('Gagal mengajukan tiket. Silakan coba lagi.');
                }
            } catch (error) {
                console.error('Error creating ticket:', error);
                alert('Terjadi kesalahan. Silakan coba lagi.');
            }
        });
    }
    
    // Refresh tickets
    if (refreshTicketsButton) {
        refreshTicketsButton.addEventListener('click', function() {
            loadUserTickets();
        });
    }
    
    // Close modal
    if (closeModalButton) {
        closeModalButton.addEventListener('click', function() {
            hideModal(successModal);
        });
    }
    
    // Close modal when clicking outside
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === successModal) {
                hideModal(successModal);
            }
        });
    }
}

// Initialize IT Dashboard
function initITDashboard() {
    const refreshTicketsButton = document.getElementById('refreshTickets');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const divisionFilter = document.getElementById('divisionFilter');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const applyDateFilter = document.getElementById('applyDateFilter');
    const clearDateFilter = document.getElementById('clearDateFilter');
    const updateModal = document.getElementById('updateModal');
    const closeUpdateModal = document.getElementById('closeUpdateModal');
    const cancelUpdate = document.getElementById('cancelUpdate');
    const updateTicketForm = document.getElementById('updateTicketForm');
    
    // Set default date values (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
    endDate.value = today.toISOString().split('T')[0];
    
    // Load tickets
    loadTicketsForDashboard();
    
    // Refresh tickets
    if (refreshTicketsButton) {
        refreshTicketsButton.addEventListener('click', function() {
            loadTicketsForDashboard();
        });
    }
    
    // Search and filter events
    const filterInputs = [searchInput, statusFilter, categoryFilter, divisionFilter];
    filterInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                loadTicketsForDashboard();
            });
        }
    });
    
    // Date filter events
    if (applyDateFilter) {
        applyDateFilter.addEventListener('click', function() {
            loadTicketsForDashboard();
        });
    }
    
    if (clearDateFilter) {
        clearDateFilter.addEventListener('click', function() {
            // Reset to default (last 30 days)
            startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
            endDate.value = today.toISOString().split('T')[0];
            loadTicketsForDashboard();
        });
    }
    
    // Modal events
    if (closeUpdateModal) {
        closeUpdateModal.addEventListener('click', function() {
            hideModal(updateModal);
        });
    }
    
    if (cancelUpdate) {
        cancelUpdate.addEventListener('click', function() {
            hideModal(updateModal);
        });
    }
    
    if (updateModal) {
        updateModal.addEventListener('click', function(e) {
            if (e.target === updateModal) {
                hideModal(updateModal);
            }
        });
    }
    
    // Update ticket form submission
    if (updateTicketForm) {
        updateTicketForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const ticketId = document.getElementById('updateTicketId').value;
            const status = document.getElementById('updateStatus').value;
            const assignedTo = document.getElementById('updateAssignedTo').value;
            const notes = document.getElementById('updateNotes').value;
            
            const updates = {
                status: status,
                assignedTo: assignedTo || null
            };
            
            if (notes.trim() !== '') {
                updates.catatanBaru = notes.trim();
            }
            
            try {
                const result = await AppScriptAPI.updateTicket(ticketId, updates);
                
                if (result.success) {
                    hideModal(updateModal);
                    loadTicketsForDashboard();
                } else {
                    alert('Gagal memperbarui tiket. Silakan coba lagi.');
                }
            } catch (error) {
                console.error('Error updating ticket:', error);
                alert('Terjadi kesalahan. Silakan coba lagi.');
            }
        });
    }
}

// Initialize Report Page
function initReportPage() {
    const reportType = document.getElementById('reportType');
    const reportMonth = document.getElementById('reportMonth');
    const reportYear = document.getElementById('reportYear');
    const generateReport = document.getElementById('generateReport');
    const exportCSV = document.getElementById('exportCSV');
    
    // Populate month and year options
    populateDateOptions();
    
    // Set default values (current month and year)
    const today = new Date();
    reportMonth.value = today.getMonth();
    reportYear.value = today.getFullYear();
    
    // Toggle month selector based on report type
    if (reportType) {
        reportType.addEventListener('change', function() {
            const monthSelector = document.getElementById('monthSelector');
            if (reportType.value === 'monthly') {
                monthSelector.classList.remove('hidden');
            } else {
                monthSelector.classList.add('hidden');
            }
        });
    }
    
    // Generate report
    if (generateReport) {
        generateReport.addEventListener('click', function() {
            loadReportData();
        });
    }
    
    // Export CSV
    if (exportCSV) {
        exportCSV.addEventListener('click', function() {
            exportReportToCSV();
        });
    }
    
    // Load initial report data
    loadReportData();
}

// Load user's ticket history
async function loadUserTickets() {
    const ticketHistory = document.getElementById('ticketHistory');
    if (!ticketHistory) return;
    
    // In a real app, we would get the user's email from authentication
    // For demo, we'll use a placeholder or get from the last submitted form
    const userEmail = localStorage.getItem('lastUserEmail') || 'demo@example.com';
    
    try {
        const result = await AppScriptAPI.getTicketsByEmail(userEmail);
        
        if (result.success && result.tickets.length > 0) {
            let ticketsHTML = '';
            
            result.tickets.forEach(ticket => {
                ticketsHTML += `
                <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 transition-colors duration-300">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                        <div>
                            <h3 class="font-medium text-gray-900 dark:text-white">${ticket.id} - ${ticket.kategori}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${TicketUI.formatDate(ticket.tanggalDibuat)}</p>
                        </div>
                        <div class="mt-2 sm:mt-0">
                            <span class="${TicketUI.getStatusBadgeClass(ticket.status)} status-badge">
                                ${TicketUI.getStatusText(ticket.status)}
                            </span>
                        </div>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 mb-2">${ticket.deskripsi}</p>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-500 dark:text-gray-400">Urgensi: 
                            <span class="${TicketUI.getUrgencyColor(ticket.urgensi)} px-2 py-1 rounded-full">
                                ${ticket.urgensi}
                            </span>
                        </span>
                        <span class="text-gray-500 dark:text-gray-400">Divisi: ${ticket.divisi}</span>
                    </div>
                </div>
                `;
            });
            
            ticketHistory.innerHTML = ticketsHTML;
        } else {
            ticketHistory.innerHTML = `
            <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                <i class="fas fa-ticket-alt text-4xl mb-3 opacity-50"></i>
                <p>Belum ada tiket yang diajukan</p>
            </div>
            `;
        }
    } catch (error) {
        console.error('Error loading user tickets:', error);
        ticketHistory.innerHTML = `
        <div class="text-center py-8 text-red-500">
            <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
            <p>Gagal memuat riwayat tiket</p>
        </div>
        `;
    }
}

// Load tickets for IT dashboard
async function loadTicketsForDashboard() {
    const ticketsTableBody = document.getElementById('ticketsTableBody');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const totalTickets = document.getElementById('totalTickets');
    const inProgressTickets = document.getElementById('inProgressTickets');
    const resolvedTickets = document.getElementById('resolvedTickets');
    const openTickets = document.getElementById('openTickets');
    
    if (!ticketsTableBody) return;
    
    // Show loading state
    ticketsTableBody.innerHTML = '';
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    // Get filter values
    const search = document.getElementById('searchInput')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const kategori = document.getElementById('categoryFilter')?.value || '';
    const divisi = document.getElementById('divisionFilter')?.value || '';
    const startDate = document.getElementById('startDate')?.value || '';
    const endDate = document.getElementById('endDate')?.value || '';
    
    const filters = {
        search,
        status,
        kategori,
        divisi,
        startDate,
        endDate
    };
    
    try {
        const result = await AppScriptAPI.getTickets(filters);
        
        // Hide loading state
        loadingState.classList.add('hidden');
        
        if (result.success && result.tickets.length > 0) {
            let ticketsHTML = '';
            
            result.tickets.forEach(ticket => {
                ticketsHTML += `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${ticket.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div>${ticket.nama}</div>
                        <div class="text-xs">${ticket.email}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${ticket.divisi}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${ticket.kategori}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span class="${TicketUI.getUrgencyColor(ticket.urgensi)} px-2 py-1 rounded-full text-xs">
                            ${ticket.urgensi}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="${TicketUI.getStatusBadgeClass(ticket.status)} status-badge">
                            ${TicketUI.getStatusText(ticket.status)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${TicketUI.formatDate(ticket.tanggalDibuat)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 update-ticket-btn" data-id="${ticket.id}">
                            <i class="fas fa-edit mr-1"></i> Update
                        </button>
                    </td>
                </tr>
                `;
            });
            
            ticketsTableBody.innerHTML = ticketsHTML;
            emptyState.classList.add('hidden');
            
            // Add event listeners to update buttons
            document.querySelectorAll('.update-ticket-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const ticketId = this.getAttribute('data-id');
                    openUpdateModal(ticketId);
                });
            });
            
            // Update statistics
            const stats = ticketManager.getStatistics();
            if (totalTickets) totalTickets.textContent = stats.total;
            if (inProgressTickets) inProgressTickets.textContent = stats.inProgress;
            if (resolvedTickets) resolvedTickets.textContent = stats.resolved + stats.closed;
            if (openTickets) openTickets.textContent = stats.open;
        } else {
            ticketsTableBody.innerHTML = '';
            emptyState.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">Gagal memuat data</h3>
                <p class="text-gray-500 dark:text-gray-400">Terjadi kesalahan saat memuat data tiket.</p>
            </div>
        `;
    }
}

// Load report data
async function loadReportData() {
    const reportType = document.getElementById('reportType').value;
    const reportMonth = parseInt(document.getElementById('reportMonth').value);
    const reportYear = parseInt(document.getElementById('reportYear').value);
    
    const reportTableBody = document.getElementById('reportTableBody');
    const reportEmptyState = document.getElementById('reportEmptyState');
    const reportTotalTickets = document.getElementById('reportTotalTickets');
    const reportResolvedTickets = document.getElementById('reportResolvedTickets');
    const reportAvgTime = document.getElementById('reportAvgTime');
    const reportPendingTickets = document.getElementById('reportPendingTickets');
    
    try {
        const result = await AppScriptAPI.getReport(reportType, reportYear, reportMonth);
        
        if (result.success && result.tickets.length > 0) {
            let reportHTML = '';
            let totalResolved = 0;
            let totalTime = 0;
            let resolvedCount = 0;
            
            result.tickets.forEach(ticket => {
                const createdDate = new Date(ticket.tanggalDibuat);
                const updatedDate = new Date(ticket.tanggalDiupdate);
                const timeDiff = updatedDate - createdDate;
                const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
                
                if (ticket.status === 'resolved' || ticket.status === 'closed') {
                    totalResolved++;
                    totalTime += hoursDiff;
                    resolvedCount++;
                }
                
                reportHTML += `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${ticket.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${ticket.nama}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${ticket.divisi}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${ticket.kategori}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="${TicketUI.getStatusBadgeClass(ticket.status)} status-badge">
                            ${TicketUI.getStatusText(ticket.status)}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${createdDate.toLocaleDateString('id-ID')}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${(ticket.status === 'resolved' || ticket.status === 'closed') ? updatedDate.toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${(ticket.status === 'resolved' || ticket.status === 'closed') ? `${hoursDiff} jam` : '-'}
                    </td>
                </tr>
                `;
            });
            
            reportTableBody.innerHTML = reportHTML;
            reportEmptyState.classList.add('hidden');
            
            // Update summary statistics
            const avgTime = resolvedCount > 0 ? Math.round(totalTime / resolvedCount) : 0;
            const pendingTickets = result.tickets.length - totalResolved;
            
            if (reportTotalTickets) reportTotalTickets.textContent = result.tickets.length;
            if (reportResolvedTickets) reportResolvedTickets.textContent = totalResolved;
            if (reportAvgTime) reportAvgTime.textContent = `${avgTime}h`;
            if (reportPendingTickets) reportPendingTickets.textContent = pendingTickets;
            
            // Update charts
            updateCharts(result.tickets);
        } else {
            reportTableBody.innerHTML = '';
            reportEmptyState.classList.remove('hidden');
            
            // Reset summary statistics
            if (reportTotalTickets) reportTotalTickets.textContent = '0';
            if (reportResolvedTickets) reportResolvedTickets.textContent = '0';
            if (reportAvgTime) reportAvgTime.textContent = '0h';
            if (reportPendingTickets) reportPendingTickets.textContent = '0';
            
            // Clear charts
            clearCharts();
        }
    } catch (error) {
        console.error('Error loading report:', error);
        reportTableBody.innerHTML = '';
        reportEmptyState.classList.remove('hidden');
        reportEmptyState.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">Gagal memuat laporan</h3>
                <p class="text-gray-500 dark:text-gray-400">Terjadi kesalahan saat memuat data laporan.</p>
            </div>
        `;
    }
}

// Export report to CSV
async function exportReportToCSV() {
    const reportType = document.getElementById('reportType').value;
    const reportMonth = parseInt(document.getElementById('reportMonth').value);
    const reportYear = parseInt(document.getElementById('reportYear').value);
    
    try {
        const result = await AppScriptAPI.exportReport(reportType, reportYear, reportMonth);
        
        if (result.success && result.csvData) {
            // Create download link
            const blob = new Blob([result.csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `laporan-helpdesk-${reportType}-${reportYear}${reportType === 'monthly' ? '-' + (reportMonth + 1) : ''}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('Tidak ada data untuk diekspor.');
        }
    } catch (error) {
        console.error('Error exporting report:', error);
        alert('Gagal mengekspor laporan. Silakan coba lagi.');
    }
}

// Open update ticket modal
async function openUpdateModal(ticketId) {
    const updateModal = document.getElementById('updateModal');
    const updateTicketId = document.getElementById('updateTicketId');
    const updateStatus = document.getElementById('updateStatus');
    const updateAssignedTo = document.getElementById('updateAssignedTo');
    const updateNotes = document.getElementById('updateNotes');
    const modalUserName = document.getElementById('modalUserName');
    const modalUserDivision = document.getElementById('modalUserDivision');
    const modalCategory = document.getElementById('modalCategory');
    const modalUrgency = document.getElementById('modalUrgency');
    const modalDescription = document.getElementById('modalDescription');
    
    try {
        const result = await AppScriptAPI.getTickets();
        
        if (result.success) {
            const ticket = result.tickets.find(t => t.id === ticketId);
            
            if (ticket) {
                // Populate modal fields
                updateTicketId.value = ticket.id;
                updateStatus.value = ticket.status;
                updateAssignedTo.value = ticket.assignedTo || '';
                updateNotes.value = '';
                
                // Populate ticket details
                modalUserName.textContent = ticket.nama;
                modalUserDivision.textContent = ticket.divisi;
                modalCategory.textContent = ticket.kategori;
                modalUrgency.textContent = ticket.urgensi;
                modalDescription.textContent = ticket.deskripsi;
                
                // Show modal
                showModal(updateModal);
            }
        }
    } catch (error) {
        console.error('Error loading ticket details:', error);
        alert('Gagal memuat detail tiket. Silakan coba lagi.');
    }
}

// Validate ticket form
function validateTicketForm(ticketData) {
    if (!ticketData.nama || ticketData.nama.trim() === '') {
        alert('Nama lengkap harus diisi.');
        return false;
    }
    
    if (!ticketData.email || ticketData.email.trim() === '') {
        alert('Email harus diisi.');
        return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ticketData.email)) {
        alert('Format email tidak valid.');
        return false;
    }
    
    if (!ticketData.divisi || ticketData.divisi === '') {
        alert('Divisi harus dipilih.');
        return false;
    }
    
    if (!ticketData.kategori || ticketData.kategori === '') {
        alert('Kategori masalah harus dipilih.');
        return false;
    }
    
    if (!ticketData.urgensi) {
        alert('Tingkat urgensi harus dipilih.');
        return false;
    }
    
    if (!ticketData.deskripsi || ticketData.deskripsi.trim() === '') {
        alert('Deskripsi masalah harus diisi.');
        return false;
    }
    
    // Save user email for ticket history
    localStorage.setItem('lastUserEmail', ticketData.email);
    
    return true;
}

// Show modal with animation
function showModal(modal) {
    modal.classList.remove('hidden');
    
    // Trigger reflow
    modal.offsetHeight;
    
    // Animate in
    setTimeout(() => {
        modal.style.opacity = '1';
        const modalContent = modal.querySelector('.bg-white, .bg-gray-800');
        if (modalContent) {
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }
    }, 10);
}

// Hide modal with animation
function hideModal(modal) {
    modal.style.opacity = '0';
    const modalContent = modal.querySelector('.bg-white, .bg-gray-800');
    if (modalContent) {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.95)';
    }
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Populate date options for report
function populateDateOptions() {
    const reportMonth = document.getElementById('reportMonth');
    const reportYear = document.getElementById('reportYear');
    
    if (!reportMonth || !reportYear) return;
    
    // Populate months
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        reportMonth.appendChild(option);
    });
    
    // Populate years (current year and previous 5 years)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        reportYear.appendChild(option);
    }
}

// Update charts with report data
function updateCharts(tickets) {
    // Tickets by Category chart
    const categoryChartEl = document.getElementById('categoryChart');
    const statusChartEl = document.getElementById('statusChart');
    
    if (!categoryChartEl || !statusChartEl) return;
    
    // Clear existing charts
    categoryChartEl.innerHTML = '';
    statusChartEl.innerHTML = '';
    
    // Create category chart
    const categoryCanvas = document.createElement('canvas');
    categoryChartEl.appendChild(categoryCanvas);
    
    const categoryCtx = categoryCanvas.getContext('2d');
    
    // Count tickets by category
    const categoryCounts = {};
    tickets.forEach(ticket => {
        categoryCounts[ticket.kategori] = (categoryCounts[ticket.kategori] || 0) + 1;
    });
    
    const categoryLabels = Object.keys(categoryCounts);
    const categoryData = Object.values(categoryCounts);
    
    // Create category chart
    new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: categoryLabels,
            datasets: [{
                data: categoryData,
                backgroundColor: [
                    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
                    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
                ],
                borderWidth: 2,
                borderColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
    
    // Create status chart
    const statusCanvas = document.createElement('canvas');
    statusChartEl.appendChild(statusCanvas);
    
    const statusCtx = statusCanvas.getContext('2d');
    
    // Count tickets by status
    const statusCounts = {
        'Open': 0,
        'Dalam Proses': 0,
        'Butuh Info': 0,
        'Selesai': 0,
        'Closed': 0
    };
    
    tickets.forEach(ticket => {
        const statusText = TicketUI.getStatusText(ticket.status);
        statusCounts[statusText] = (statusCounts[statusText] || 0) + 1;
    });
    
    const statusLabels = Object.keys(statusCounts);
    const statusData = Object.values(statusCounts);
    
    // Create status chart
    new Chart(statusCtx, {
        type: 'bar',
        data: {
            labels: statusLabels,
            datasets: [{
                label: 'Jumlah Tiket',
                data: statusData,
                backgroundColor: [
                    '#3b82f6', // Open - blue
                    '#f59e0b', // In Progress - yellow
                    '#f97316', // Need Info - orange
                    '#10b981', // Resolved - green
                    '#6b7280'  // Closed - gray
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                    },
                    grid: {
                        color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                    }
                },
                x: {
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Clear charts
function clearCharts() {
    const categoryChartEl = document.getElementById('categoryChart');
    const statusChartEl = document.getElementById('statusChart');
    
    if (categoryChartEl) {
        categoryChartEl.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"><p>Data tidak tersedia</p></div>';
    }
    
    if (statusChartEl) {
        statusChartEl.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"><p>Data tidak tersedia</p></div>';
    }
}