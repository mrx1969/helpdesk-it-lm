// Ticket Management Functions
class TicketManager {
    constructor() {
        this.tickets = this.loadTickets();
        this.nextId = this.getNextId();
    }
    
    // Generate next ticket ID
    getNextId() {
        const maxId = this.tickets.reduce((max, ticket) => Math.max(max, parseInt(ticket.id.substring(1)) || 0), 0);
        return maxId + 1;
    }
    
    // Load tickets from localStorage
    loadTickets() {
        const ticketsJSON = localStorage.getItem('helpdesk_tickets');
        return ticketsJSON ? JSON.parse(ticketsJSON) : [];
    }
    
    // Save tickets to localStorage
    saveTickets() {
        localStorage.setItem('helpdesk_tickets', JSON.stringify(this.tickets));
    }
    
    // Create a new ticket
    createTicket(ticketData) {
        const newTicket = {
            id: `T${this.nextId.toString().padStart(4, '0')}`,
            nama: ticketData.nama,
            email: ticketData.email,
            divisi: ticketData.divisi,
            kategori: ticketData.kategori,
            urgensi: ticketData.urgensi,
            deskripsi: ticketData.deskripsi,
            file: ticketData.file || null,
            status: 'open',
            tanggalDibuat: new Date().toISOString(),
            tanggalDiupdate: new Date().toISOString(),
            catatan: [],
            assignedTo: null
        };
        
        this.tickets.push(newTicket);
        this.nextId++;
        this.saveTickets();
        
        return newTicket;
    }
    
    // Get all tickets
    getAllTickets() {
        return this.tickets;
    }
    
    // Get tickets by email (for user view)
    getTicketsByEmail(email) {
        return this.tickets.filter(ticket => ticket.email === email);
    }
    
    // Get ticket by ID
    getTicketById(id) {
        return this.tickets.find(ticket => ticket.id === id);
    }
    
    // Update ticket status and notes
    updateTicket(id, updates) {
        const ticketIndex = this.tickets.findIndex(ticket => ticket.id === id);
        
        if (ticketIndex !== -1) {
            this.tickets[ticketIndex] = {
                ...this.tickets[ticketIndex],
                ...updates,
                tanggalDiupdate: new Date().toISOString()
            };
            
            // Add note if provided
            if (updates.catatanBaru) {
                this.tickets[ticketIndex].catatan.push({
                    id: Date.now().toString(),
                    isi: updates.catatanBaru,
                    tanggal: new Date().toISOString(),
                    dibuatOleh: 'IT Support'
                });
            }
            
            this.saveTickets();
            return this.tickets[ticketIndex];
        }
        
        return null;
    }
    
    // Filter tickets based on criteria
    filterTickets(filters) {
        let filteredTickets = [...this.tickets];
        
        if (filters.status && filters.status !== '') {
            filteredTickets = filteredTickets.filter(ticket => ticket.status === filters.status);
        }
        
        if (filters.kategori && filters.kategori !== '') {
            filteredTickets = filteredTickets.filter(ticket => ticket.kategori === filters.kategori);
        }
        
        if (filters.divisi && filters.divisi !== '') {
            filteredTickets = filteredTickets.filter(ticket => ticket.divisi === filters.divisi);
        }
        
        if (filters.search && filters.search !== '') {
            const searchTerm = filters.search.toLowerCase();
            filteredTickets = filteredTickets.filter(ticket => 
                ticket.nama.toLowerCase().includes(searchTerm) ||
                ticket.email.toLowerCase().includes(searchTerm) ||
                ticket.deskripsi.toLowerCase().includes(searchTerm) ||
                ticket.id.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.startDate && filters.endDate) {
            filteredTickets = filteredTickets.filter(ticket => {
                const ticketDate = new Date(ticket.tanggalDibuat);
                const startDate = new Date(filters.startDate);
                const endDate = new Date(filters.endDate);
                endDate.setDate(endDate.getDate() + 1); // Include end date
                
                return ticketDate >= startDate && ticketDate < endDate;
            });
        }
        
        return filteredTickets;
    }
    
    // Get tickets for report (monthly/yearly)
    getTicketsForReport(period, year, month = null) {
        let filteredTickets = [...this.tickets];
        
        if (period === 'monthly' && month !== null) {
            filteredTickets = filteredTickets.filter(ticket => {
                const ticketDate = new Date(ticket.tanggalDibuat);
                return ticketDate.getFullYear() === year && ticketDate.getMonth() === month;
            });
        } else if (period === 'yearly') {
            filteredTickets = filteredTickets.filter(ticket => {
                const ticketDate = new Date(ticket.tanggalDibuat);
                return ticketDate.getFullYear() === year;
            });
        }
        
        return filteredTickets;
    }
    
    // Get statistics for dashboard
    getStatistics() {
        const total = this.tickets.length;
        const open = this.tickets.filter(t => t.status === 'open').length;
        const inProgress = this.tickets.filter(t => t.status === 'in-progress').length;
        const needInfo = this.tickets.filter(t => t.status === 'need-info').length;
        const resolved = this.tickets.filter(t => t.status === 'resolved').length;
        const closed = this.tickets.filter(t => t.status === 'closed').length;
        
        return {
            total,
            open,
            inProgress,
            needInfo,
            resolved,
            closed
        };
    }
    
    // Export tickets to CSV
    exportToCSV(tickets) {
        if (tickets.length === 0) return '';
        
        const headers = ['ID', 'Nama', 'Email', 'Divisi', 'Kategori', 'Urgensi', 'Status', 'Tanggal Dibuat', 'Tanggal Diupdate'];
        const csvRows = [headers.join(',')];
        
        tickets.forEach(ticket => {
            const row = [
                ticket.id,
                `"${ticket.nama}"`,
                ticket.email,
                ticket.divisi,
                ticket.kategori,
                ticket.urgensi,
                ticket.status,
                new Date(ticket.tanggalDibuat).toLocaleDateString('id-ID'),
                new Date(ticket.tanggalDiupdate).toLocaleDateString('id-ID')
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }
}

// Initialize TicketManager
const ticketManager = new TicketManager();

// Utility functions for UI
const TicketUI = {
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Get status badge class
    getStatusBadgeClass(status) {
        const statusClasses = {
            'open': 'status-open',
            'in-progress': 'status-in-progress',
            'need-info': 'status-need-info',
            'resolved': 'status-resolved',
            'closed': 'status-closed'
        };
        
        return statusClasses[status] || 'status-open';
    },
    
    // Get status text in Indonesian
    getStatusText(status) {
        const statusTexts = {
            'open': 'Open',
            'in-progress': 'Dalam Proses',
            'need-info': 'Butuh Info',
            'resolved': 'Selesai',
            'closed': 'Closed'
        };
        
        return statusTexts[status] || 'Open';
    },
    
    // Get urgency badge color
    getUrgencyColor(urgensi) {
        const urgencyColors = {
            'rendah': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'sedang': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'tinggi': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'kritis': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
        
        return urgencyColors[urgensi] || 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
};