// Reservation Management System
class ReservationManager {
    constructor() {
        this.reservations = this.loadReservations();
        this.beverageSelections = {};
        this.currentSection = 'dashboard';
        this.currentCalendarMonth = new Date().getMonth();
        this.currentCalendarYear = new Date().getFullYear();
        this.initializeEventListeners();
        this.initializeNavigation();
        this.updateGuestCountDisplay();
        this.calculatePrice();
        this.updateFoodServiceSummary();
        this.updateBeverageSummary();
        this.updateDashboard();
        this.displayReservations();
    }

    // Initialize navigation
    initializeNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.showSection(section);
            });
        });
    }

    // Show specific section
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        this.currentSection = sectionId;

        // Update content based on section
        switch(sectionId) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'reservations':
                this.displayReservations();
                break;
            case 'calendar':
                this.displayCalendar();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
        }
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Form inputs
        const form = document.getElementById('reservationForm');
        const guestCountSlider = document.getElementById('guestCount');
        const guestCountManual = document.getElementById('guestCountManual');
        const tableType = document.getElementById('tableType');
        const seatsPerTable = document.getElementById('seatsPerTable');
        const calculateBtn = document.getElementById('calculateBtn');
        const saveBtn = document.getElementById('saveBtn');
        const openBeverageModalBtn = document.getElementById('openBeverageModalBtn');
        const editBeveragesBtn = document.getElementById('editBeveragesBtn');
        const beverageCloseBtn = document.getElementById('beverageCloseBtn');
        const beverageCancelBtn = document.getElementById('beverageCancelBtn');
        const beverageSaveBtn = document.getElementById('beverageSaveBtn');

        // Real-time updates for pricing
        const pricingInputs = [
            'roomType', 'foodType', 'drinkType', 'eventDuration',
            'audioVisual', 'decorations', 'waitstaff', 'valet', 'tipPercentage'
        ];

        pricingInputs.forEach(inputId => {
            const element = document.getElementById(inputId);
            if (element) {
                if (element.type === 'checkbox') {
                    element.addEventListener('change', () => this.calculatePrice());
                } else {
                    element.addEventListener('change', () => { this.calculatePrice(); this.updateFoodServiceSummary(); });
                }
            }
        });

        // Buffet modal behavior
        const foodType = document.getElementById('foodType');
        foodType.addEventListener('change', () => {
            this.handleFoodTypeChange();
        });

        const buffetCloseBtn = document.getElementById('buffetCloseBtn');
        const buffetCancelBtn = document.getElementById('buffetCancelBtn');
        const buffetSaveBtn = document.getElementById('buffetSaveBtn');
        const editBuffetBtn = document.getElementById('editBuffetBtn');

        buffetCloseBtn?.addEventListener('click', () => this.closeBuffetModal());
        buffetCancelBtn?.addEventListener('click', () => {
            // reset foodType if cancel from initial open
            const ft = document.getElementById('foodType');
            if (ft && this.isBuffet(ft.value)) {
                ft.value = '';
            }
            this.clearBuffetSelections();
            this.closeBuffetModal();
            this.calculatePrice();
        });
        buffetSaveBtn?.addEventListener('click', () => {
            this.closeBuffetModal();
            this.calculatePrice();
            this.updateFoodServiceSummary();
        });
        editBuffetBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openBuffetModal();
        });

        // Guest count slider
        guestCountSlider.addEventListener('input', () => {
            this.updateGuestCountDisplay();
            this.syncGuestCountInputs();
            this.calculateTableCount();
            this.calculatePrice();
        });

        // Guest count manual input
        guestCountManual.addEventListener('input', () => {
            this.syncGuestCountFromManual();
            this.calculateTableCount();
            this.calculatePrice();
        });

        // Event type selection
        const eventType = document.getElementById('eventType');
        eventType?.addEventListener('change', () => {
            this.handleEventTypeChange();
        });

        // Table type selection
        tableType.addEventListener('change', () => {
            this.handleTableTypeChange();
            this.calculateTableCount();
        });

        // Custom seats per table
        seatsPerTable.addEventListener('input', () => {
            this.calculateTableCount();
        });

        // Beverage modal events
        openBeverageModalBtn?.addEventListener('click', () => this.openBeverageModal());
        editBeveragesBtn?.addEventListener('click', () => this.openBeverageModal());
        beverageCloseBtn?.addEventListener('click', () => this.closeBeverageModal());
        beverageCancelBtn?.addEventListener('click', () => this.closeBeverageModal());
        beverageSaveBtn?.addEventListener('click', () => {
            this.saveBeverageSelectionsFromModal();
            this.updateBeverageSummary();
            this.calculatePrice();
            this.closeBeverageModal();
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveReservation();
        });

        // Reservation details modal events
        const reservationDetailsModal = document.getElementById('reservationDetailsModal');
        const reservationDetailsCloseBtn = document.getElementById('reservationDetailsCloseBtn');
        const reservationDetailsCloseBtn2 = document.getElementById('reservationDetailsCloseBtn2');
        reservationDetailsCloseBtn?.addEventListener('click', () => this.closeReservationDetailsModal());
        reservationDetailsCloseBtn2?.addEventListener('click', () => this.closeReservationDetailsModal());
        
        // Close modal when clicking outside
        reservationDetailsModal?.addEventListener('click', (e) => {
            if (e.target === reservationDetailsModal) {
                this.closeReservationDetailsModal();
            }
        });

        // Button events
        calculateBtn.addEventListener('click', () => this.calculatePrice());
    }

    // Launch modal when buffet is selected
    handleFoodTypeChange() {
        const foodType = document.getElementById('foodType');
        if (foodType && this.isBuffet(foodType.value)) {
            this.openBuffetModal();
        } else {
            this.clearBuffetSelections();
        }
        // Recalculate price to keep totals fresh
        this.calculatePrice();
        this.updateFoodServiceSummary();
    }

    openBuffetModal() {
        const modal = document.getElementById('buffetModal');
        if (!modal) return;
        // Show with entrance animation
        modal.classList.remove('hidden');
        // Force reflow so the next class triggers transition
        void modal.offsetWidth;
        modal.classList.add('visible');
    }

    closeBuffetModal() {
        const modal = document.getElementById('buffetModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 220);
    }

    clearBuffetSelections() {
        ['buffetRice','buffetProtein1','buffetProtein2','buffetSide','buffetSalad']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    }

    // Build and render Food & Beverage summary (buffet only)
    updateFoodServiceSummary() {
        const container = document.getElementById('foodServiceSummary');
        const editBtn = document.getElementById('editBuffetBtn');
        if (!container) return;

        const foodTypeEl = document.getElementById('foodType');
        const foodType = foodTypeEl?.value || '';
        
        if (!this.isBuffet(foodType)) {
            container.classList.add('hidden');
            container.innerHTML = '';
            editBtn?.classList.add('hidden');
            return;
        }

        const rice = document.getElementById('buffetRice');
        const p1 = document.getElementById('buffetProtein1');
        const p2 = document.getElementById('buffetProtein2');
        const side = document.getElementById('buffetSide');
        const salad = document.getElementById('buffetSalad');

        const items = [];
        if (rice?.value) items.push(`<li>Arroz: ${rice.selectedOptions[0].text}</li>`);
        if (p1?.value) items.push(`<li>Proteína 1: ${p1.selectedOptions[0].text}</li>`);
        if (p2?.value) items.push(`<li>Proteína 2: ${p2.selectedOptions[0].text}</li>`);
        if (side?.value) items.push(`<li>Complemento: ${side.selectedOptions[0].text}</li>`);
        if (salad?.value) items.push(`<li>Ensalada: ${salad.selectedOptions[0].text}</li>`);

        container.classList.remove('hidden');
        editBtn?.classList.remove('hidden');
        container.innerHTML = items.length
            ? `<ul>${items.join('')}</ul>`
            : '<em>Seleccione opciones del buffet y haga clic en Save.</em>';
    }

    // ----- Beverages modal helpers -----
    getBeverageItems() {
        return [
            // Non-alcoholic
            { id: 'soft-drinks', name: 'Caja de Refrescos (24)', price: 35, alcohol: false },
            { id: 'water', name: 'Caja de Agua (24)', price: 20, alcohol: false },
            // Beers
            { id: 'michelob', name: 'Michelob', price: 72, alcohol: true },
            { id: 'medalla', name: 'Medalla', price: 72, alcohol: true },
            { id: 'heineken', name: 'Heineken', price: 72, alcohol: true },
            { id: 'coors', name: 'Coors Light', price: 72, alcohol: true },
            { id: 'corona', name: 'Corona', price: 72, alcohol: true },
            { id: 'modelo', name: 'Modelo', price: 72, alcohol: true },
            // Liquors
            { id: 'black-label-1l', name: '1 Litro Black Label', price: 65, alcohol: true },
            { id: 'tito-1l', name: '1 Litro Tito Vodka', price: 45, alcohol: true },
            { id: 'dewars-12-handle', name: 'Gancho Dewars 12', price: 200, alcohol: true },
            { id: 'dewars-handle', name: 'Gancho Dewars Reg.', price: 150, alcohol: true },
            { id: 'donq-cristal-handle', name: 'Gancho Don Q Cristal', price: 75, alcohol: true },
            { id: 'donq-limon-handle', name: 'Gancho Don Q Limón', price: 75, alcohol: true },
            { id: 'donq-passion-handle', name: 'Gancho Don Q Passion', price: 75, alcohol: true },
            { id: 'donq-coco-handle', name: 'Gancho Don Q Coco', price: 75, alcohol: true },
            { id: 'donq-naranja-handle', name: 'Gancho Don Q Naranja', price: 75, alcohol: true },
            { id: 'donq-oro-handle', name: 'Gancho Don Q Oro', price: 75, alcohol: true },
            { id: 'tito-handle', name: 'Gancho Tito Vodka', price: 150, alcohol: true },
            // Wines
            { id: 'red-wine-25', name: 'Botella de Vino Tinto ($25)', price: 25, alcohol: true },
            { id: 'red-wine-30', name: 'Botella de Vino Tinto ($30)', price: 30, alcohol: true },
            { id: 'red-wine-35-1', name: 'Botella de Vino Tinto ($35)', price: 35, alcohol: true },
            { id: 'red-wine-35-2', name: 'Botella de Vino Tinto ($35)', price: 35, alcohol: true },
            { id: 'red-wine-40', name: 'Botella de Vino Tinto ($40)', price: 40, alcohol: true },
            { id: 'white-wine-25', name: 'Botella de Vino Blanco ($25)', price: 25, alcohol: true },
            { id: 'white-wine-30', name: 'Botella de Vino Blanco ($30)', price: 30, alcohol: true },
            { id: 'white-wine-35-1', name: 'Botella de Vino Blanco ($35)', price: 35, alcohol: true },
            { id: 'white-wine-35-2', name: 'Botella de Vino Blanco ($35)', price: 35, alcohol: true },
            { id: 'white-wine-40', name: 'Botella de Vino Blanco ($40)', price: 40, alcohol: true },
        ];
    }

    openBeverageModal() {
        const modal = document.getElementById('beverageModal');
        if (!modal) return;
        // Prefill inputs from current selections
        const map = {
            'bev-soft-drinks': 'soft-drinks',
            'bev-water': 'water',
            'bev-michelob': 'michelob',
            'bev-medalla': 'medalla',
            'bev-heineken': 'heineken',
            'bev-coors': 'coors',
            'bev-corona': 'corona',
            'bev-modelo': 'modelo',
            'bev-black-label-1l': 'black-label-1l',
            'bev-tito-1l': 'tito-1l',
            'bev-dewars-12-handle': 'dewars-12-handle',
            'bev-dewars-handle': 'dewars-handle',
            'bev-donq-cristal-handle': 'donq-cristal-handle',
            'bev-donq-limon-handle': 'donq-limon-handle',
            'bev-donq-passion-handle': 'donq-passion-handle',
            'bev-donq-coco-handle': 'donq-coco-handle',
            'bev-donq-naranja-handle': 'donq-naranja-handle',
            'bev-donq-oro-handle': 'donq-oro-handle',
            'bev-tito-handle': 'tito-handle',
            'bev-red-wine-25': 'red-wine-25',
            'bev-red-wine-30': 'red-wine-30',
            'bev-red-wine-35-1': 'red-wine-35-1',
            'bev-red-wine-35-2': 'red-wine-35-2',
            'bev-red-wine-40': 'red-wine-40',
            'bev-white-wine-25': 'white-wine-25',
            'bev-white-wine-30': 'white-wine-30',
            'bev-white-wine-35-1': 'white-wine-35-1',
            'bev-white-wine-35-2': 'white-wine-35-2',
            'bev-white-wine-40': 'white-wine-40',
        };
        Object.entries(map).forEach(([inputId, key]) => {
            const el = document.getElementById(inputId);
            if (el) {
                const qty = this.beverageSelections[key] || 0;
                el.value = qty;
                const wrapper = el.parentElement;
                if (wrapper) {
                    if (qty > 0) wrapper.classList.add('selected');
                    else wrapper.classList.remove('selected');
                }
            }
        });
        // Attach change handlers for selection animation
        this.attachBeverageInputHandlers();
        // Show with entrance animation
        modal.classList.remove('hidden');
        // Force reflow so the next class triggers transition
        void modal.offsetWidth;
        modal.classList.add('visible');
    }

    closeBeverageModal() {
        const modal = document.getElementById('beverageModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 220);
    }

    saveBeverageSelectionsFromModal() {
        const inputs = [
            { inputId: 'bev-soft-drinks', key: 'soft-drinks' },
            { inputId: 'bev-water', key: 'water' },
            { inputId: 'bev-michelob', key: 'michelob' },
            { inputId: 'bev-medalla', key: 'medalla' },
            { inputId: 'bev-heineken', key: 'heineken' },
            { inputId: 'bev-coors', key: 'coors' },
            { inputId: 'bev-corona', key: 'corona' },
            { inputId: 'bev-modelo', key: 'modelo' },
            { inputId: 'bev-black-label-1l', key: 'black-label-1l' },
            { inputId: 'bev-tito-1l', key: 'tito-1l' },
            { inputId: 'bev-dewars-12-handle', key: 'dewars-12-handle' },
            { inputId: 'bev-dewars-handle', key: 'dewars-handle' },
            { inputId: 'bev-donq-cristal-handle', key: 'donq-cristal-handle' },
            { inputId: 'bev-donq-limon-handle', key: 'donq-limon-handle' },
            { inputId: 'bev-donq-passion-handle', key: 'donq-passion-handle' },
            { inputId: 'bev-donq-coco-handle', key: 'donq-coco-handle' },
            { inputId: 'bev-donq-naranja-handle', key: 'donq-naranja-handle' },
            { inputId: 'bev-donq-oro-handle', key: 'donq-oro-handle' },
            { inputId: 'bev-tito-handle', key: 'tito-handle' },
            { inputId: 'bev-red-wine-25', key: 'red-wine-25' },
            { inputId: 'bev-red-wine-30', key: 'red-wine-30' },
            { inputId: 'bev-red-wine-35-1', key: 'red-wine-35-1' },
            { inputId: 'bev-red-wine-35-2', key: 'red-wine-35-2' },
            { inputId: 'bev-red-wine-40', key: 'red-wine-40' },
            { inputId: 'bev-white-wine-25', key: 'white-wine-25' },
            { inputId: 'bev-white-wine-30', key: 'white-wine-30' },
            { inputId: 'bev-white-wine-35-1', key: 'white-wine-35-1' },
            { inputId: 'bev-white-wine-35-2', key: 'white-wine-35-2' },
            { inputId: 'bev-white-wine-40', key: 'white-wine-40' },
        ];
        const selections = {};
        inputs.forEach(({ inputId, key }) => {
            const el = document.getElementById(inputId);
            const qty = parseInt(el?.value) || 0;
            if (qty > 0) selections[key] = qty;
        });
        this.beverageSelections = selections;
    }

    updateBeverageSummary() {
        const container = document.getElementById('beverageSummary');
        const editBtn = document.getElementById('editBeveragesBtn');
        const selectBtn = document.getElementById('openBeverageModalBtn');
        if (!container) return;
        const beverages = this.getBeverageItems();
        const items = Object.entries(this.beverageSelections)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => {
                const item = beverages.find(b => b.id === id);
                const label = item ? item.name : id;
                return `<li>${label}: ${qty}</li>`;
            });
        if (items.length === 0) {
            container.classList.add('hidden');
            container.innerHTML = '';
            editBtn?.classList.add('hidden');
            selectBtn?.classList.remove('hidden');
            return;
        }
        container.classList.remove('hidden');
        editBtn?.classList.remove('hidden');
        selectBtn?.classList.add('hidden');
        container.innerHTML = `<ul>${items.join('')}</ul>`;
    }

    attachBeverageInputHandlers() {
        const modal = document.getElementById('beverageModal');
        if (!modal) return;
        const numberInputs = modal.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            input.oninput = () => {
                const qty = parseInt(input.value) || 0;
                if (qty < 0) input.value = 0;
                const wrapper = input.parentElement;
                if (!wrapper) return;
                if (qty > 0) {
                    if (!wrapper.classList.contains('selected')) {
                        wrapper.classList.add('selected', 'just-selected');
                        setTimeout(() => wrapper.classList.remove('just-selected'), 650);
                    }
                } else {
                    wrapper.classList.remove('selected');
                }
            };
        });
    }

    // Stable accordion animation (height transition with JS)
    attachStableAccordionAnimation() {}

    // helpers
    isBuffet(value) {
        return typeof value === 'string' && value.startsWith('buffet');
    }

    // Convert 24-hour time to 12-hour format
    formatTime12Hour(time24) {
        if (!time24) return '';
        
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        return `${hour12}:${minutes} ${ampm}`;
    }

    // Update guest count display
    updateGuestCountDisplay() {
        const slider = document.getElementById('guestCount');
        const display = document.getElementById('guestCountValue');
        display.textContent = slider.value;
    }

    // Sync guest count inputs (slider to manual input)
    syncGuestCountInputs() {
        const slider = document.getElementById('guestCount');
        const manualInput = document.getElementById('guestCountManual');
        manualInput.value = slider.value;
    }

    // Sync guest count from manual input to slider
    syncGuestCountFromManual() {
        const manualInput = document.getElementById('guestCountManual');
        const slider = document.getElementById('guestCount');
        const display = document.getElementById('guestCountValue');
        
        let value = parseInt(manualInput.value);
        
        // Validate and constrain the value
        if (isNaN(value) || value < 1) {
            value = 1;
        } else if (value > 500) {
            value = 500;
        }
        
        // Update manual input with validated value
        manualInput.value = value;
        
        // Update slider (round to nearest 10 for slider)
        const sliderValue = Math.round(value / 10) * 10;
        slider.value = sliderValue;
        
        // Update display
        display.textContent = value;
    }

    // Handle event type change
    handleEventTypeChange() {
        const eventType = document.getElementById('eventType');
        const otherEventTypeGroup = document.getElementById('otherEventTypeGroup');
        const otherEventType = document.getElementById('otherEventType');
        
        if (eventType.value === 'other') {
            otherEventTypeGroup.classList.remove('hidden');
            otherEventType.required = true;
        } else {
            otherEventTypeGroup.classList.add('hidden');
            otherEventType.required = false;
            otherEventType.value = '';
        }
    }

    // Handle table type change
    handleTableTypeChange() {
        const tableType = document.getElementById('tableType');
        const customTableGroup = document.getElementById('customTableGroup');
        const seatsPerTable = document.getElementById('seatsPerTable');
        
        if (tableType.value === 'custom') {
            customTableGroup.classList.remove('hidden');
            seatsPerTable.required = true;
        } else {
            customTableGroup.classList.add('hidden');
            seatsPerTable.required = false;
            seatsPerTable.value = '';
        }
    }

    // Calculate table count based on guest count and table configuration
    calculateTableCount() {
        const guestCountManual = document.getElementById('guestCountManual');
        const guestCount = parseInt(guestCountManual.value) || parseInt(document.getElementById('guestCount').value);
        const tableType = document.getElementById('tableType');
        const seatsPerTable = document.getElementById('seatsPerTable');
        const tableCountElement = document.getElementById('tableCount');
        
        if (!guestCount || guestCount < 1) {
            tableCountElement.textContent = '0';
            return;
        }
        
        let seatsPerTableValue;
        
        if (tableType.value === 'custom') {
            seatsPerTableValue = parseInt(seatsPerTable.value);
            if (!seatsPerTableValue || seatsPerTableValue < 2) {
                tableCountElement.textContent = '0';
                return;
            }
        } else if (tableType.value) {
            // Extract seats from table type (e.g., "round-8" -> 8)
            seatsPerTableValue = parseInt(tableType.value.split('-')[1]);
        } else {
            tableCountElement.textContent = '0';
            return;
        }
        
        // Calculate number of tables needed (round up)
        const tableCount = Math.ceil(guestCount / seatsPerTableValue);
        tableCountElement.textContent = tableCount;
    }

    // Get seats per table from table type
    getSeatsPerTableFromType(tableType) {
        if (!tableType || tableType === 'custom') return null;
        return parseInt(tableType.split('-')[1]);
    }

    // Calculate table count for reservation
    calculateTableCountForReservation(guestCount, tableType, customSeatsPerTable) {
        let seatsPerTableValue;
        
        if (tableType === 'custom') {
            seatsPerTableValue = parseInt(customSeatsPerTable);
        } else if (tableType) {
            seatsPerTableValue = parseInt(tableType.split('-')[1]);
        } else {
            return 0;
        }
        
        if (!seatsPerTableValue || seatsPerTableValue < 2) return 0;
        
        return Math.ceil(guestCount / seatsPerTableValue);
    }

    // Calculate pricing in real-time
    calculatePrice() {
        const guestCountManual = document.getElementById('guestCountManual');
        const guestCount = parseInt(guestCountManual.value) || parseInt(document.getElementById('guestCount').value);
        const roomType = document.getElementById('roomType');
        const foodType = document.getElementById('foodType');
        const eventDuration = parseInt(document.getElementById('eventDuration').value) || 1;

        // Room cost - only apply if "No Food Service" is selected
        const foodTypeValue = foodType.value;
        let roomCost = 0;
        if (foodTypeValue === 'no-food') {
        const roomPrice = roomType.selectedOptions[0]?.dataset.price || 0;
            roomCost = parseFloat(roomPrice) * eventDuration;
        }

        // Food cost
        const foodPrice = foodType.selectedOptions[0]?.dataset.price || 0;
        const foodCost = parseFloat(foodPrice) * guestCount;

        // Drink cost
        // Beverage cost from selections
        const beverages = this.getBeverageItems();
        let drinkCost = 0;
        let alcoholicQty = 0;
        Object.entries(this.beverageSelections).forEach(([id, qty]) => {
            const item = beverages.find(b => b.id === id);
            if (item && qty > 0) {
                drinkCost += item.price * qty;
                if (item.alcohol) alcoholicQty += qty;
            }
        });

        // Taxes (apply only to food and alcoholic beverages)
        const isAlcoholic = alcoholicQty > 0;
        const foodStateReducedTax = foodCost * 0.06; // 6%
        const foodCityTax = foodCost * 0.01; // 1%
        const alcoholStateTax = isAlcoholic ? drinkCost * 0.105 : 0; // 10.5%

        // Additional services cost
        const additionalServices = ['audioVisual', 'decorations', 'waitstaff', 'valet'];
        let additionalCost = 0;
        
        additionalServices.forEach(service => {
            const checkbox = document.getElementById(service);
            if (checkbox && checkbox.checked) {
                additionalCost += parseFloat(checkbox.dataset.price);
            }
        });

        // Update display
        document.getElementById('roomCost').textContent = `$${roomCost.toFixed(2)}`;
        document.getElementById('foodCost').textContent = `$${foodCost.toFixed(2)}`;
        document.getElementById('drinkCost').textContent = `$${drinkCost.toFixed(2)}`;
        document.getElementById('foodStateReducedTax').textContent = `$${foodStateReducedTax.toFixed(2)}`;
        document.getElementById('foodCityTax').textContent = `$${foodCityTax.toFixed(2)}`;
        const alcoholRow = document.getElementById('alcoholTaxRow');
        if (alcoholRow) alcoholRow.style.display = alcoholStateTax > 0 ? 'flex' : 'none';
        document.getElementById('alcoholStateTax').textContent = `$${alcoholStateTax.toFixed(2)}`;
        document.getElementById('additionalCost').textContent = `$${additionalCost.toFixed(2)}`;

        const totalTaxes = foodStateReducedTax + foodCityTax + alcoholStateTax;
        document.getElementById('taxSubtotal').textContent = `$${totalTaxes.toFixed(2)}`;
        
        // Calculate subtotal (before tip)
        const subtotalBeforeTip = roomCost + foodCost + drinkCost + additionalCost + totalTaxes;
        
        // Calculate tip
        const tipPercentage = parseFloat(document.getElementById('tipPercentage')?.value || 0);
        const tipAmount = subtotalBeforeTip * (tipPercentage / 100);
        document.getElementById('tipAmount').textContent = `$${tipAmount.toFixed(2)} (${tipPercentage}%)`;
        
        // Calculate final total (with tip)
        const totalCost = subtotalBeforeTip + tipAmount;
        document.getElementById('totalCost').textContent = `$${totalCost.toFixed(2)}`;
        
        // Calculate deposit (20% of total cost)
        const depositAmount = totalCost * 0.20;
        document.getElementById('depositAmount').textContent = `$${depositAmount.toFixed(2)}`;

        return {
            roomCost,
            foodCost,
            drinkCost,
            additionalCost,
            taxes: {
                foodStateReducedTax,
                foodCityTax,
                alcoholStateTax,
                totalTaxes
            },
            tip: {
                percentage: tipPercentage,
                amount: tipAmount
            },
            subtotalBeforeTip,
            totalCost,
            depositAmount,
            guestCount,
            eventDuration
        };
    }

    // Save reservation
    saveReservation() {
        const formEl = document.getElementById('reservationForm');
        const formData = new FormData(formEl);
        const pricing = this.calculatePrice();

        // Validate required fields
        const requiredFields = ['clientName', 'clientEmail', 'clientPhone', 'eventDate', 'eventTime', 'eventType', 'roomType', 'foodType'];
        const missingFields = requiredFields.filter(field => !formData.get(field));

        // Extra validation when event type is "other"
        const eventType = formData.get('eventType');
        if (eventType === 'other') {
            const otherEventType = formData.get('otherEventType');
            if (!otherEventType) {
                missingFields.push('otherEventType');
            }
        }

        // Extra validation when buffet is chosen (modal fields are outside the form)
        let buffetSelections = null;
        if (this.isBuffet(formData.get('foodType'))) {
            const riceEl = document.getElementById('buffetRice');
            const p1El = document.getElementById('buffetProtein1');
            const p2El = document.getElementById('buffetProtein2');
            const sideEl = document.getElementById('buffetSide');
            const saladEl = document.getElementById('buffetSalad');

            buffetSelections = {
                rice: riceEl?.value || '',
                protein1: p1El?.value || '',
                protein2: p2El?.value || '',
                side: sideEl?.value || '',
                salad: saladEl?.value || ''
            };

            if (!buffetSelections.rice) missingFields.push('buffetRice');
            if (!buffetSelections.protein1) missingFields.push('buffetProtein1');
            if (!buffetSelections.protein2) missingFields.push('buffetProtein2');
            if (!buffetSelections.side) missingFields.push('buffetSide');
            if (!buffetSelections.salad) missingFields.push('buffetSalad');
        }

        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Create reservation object
        const reservation = {
            id: Date.now().toString(),
            clientName: formData.get('clientName'),
            clientEmail: formData.get('clientEmail'),
            clientPhone: formData.get('clientPhone'),
            eventDate: formData.get('eventDate'),
            eventTime: formData.get('eventTime'),
            eventType: eventType === 'other' ? formData.get('otherEventType') : eventType,
            eventDuration: formData.get('eventDuration'),
            roomType: formData.get('roomType'),
            foodType: formData.get('foodType'),
            buffet: this.isBuffet(formData.get('foodType')) ? {
                rice: buffetSelections?.rice || null,
                protein1: buffetSelections?.protein1 || null,
                protein2: buffetSelections?.protein2 || null,
                side: buffetSelections?.side || null,
                salad: buffetSelections?.salad || null
            } : null,
            // drinkType removed; beverages are captured in the beverages map
            beverages: this.beverageSelections,
            guestCount: pricing.guestCount,
            tableConfiguration: {
                tableType: formData.get('tableType'),
                seatsPerTable: formData.get('seatsPerTable') || this.getSeatsPerTableFromType(formData.get('tableType')),
                tableCount: this.calculateTableCountForReservation(pricing.guestCount, formData.get('tableType'), formData.get('seatsPerTable'))
            },
            additionalServices: {
                audioVisual: formData.get('audioVisual') === 'on',
                decorations: formData.get('decorations') === 'on',
                waitstaff: formData.get('waitstaff') === 'on',
                valet: formData.get('valet') === 'on'
            },
            tipPercentage: parseFloat(formData.get('tipPercentage') || 0),
            depositPaid: false, // Default to unpaid, can be toggled later
            pricing: pricing,
            createdAt: new Date().toISOString()
        };

        // Add to reservations
        this.reservations.push(reservation);
        this.saveReservations();
        this.displayReservations();
        this.clearForm();

        // Show success message
        this.showNotification('¡Reservación guardada exitosamente!', 'success');
    }

    // Clear form
    clearForm() {
        document.getElementById('reservationForm').reset();
        this.updateGuestCountDisplay();
        this.syncGuestCountInputs();
        this.handleEventTypeChange();
        this.handleTableTypeChange();
        this.handleFoodTypeChange();
        this.calculateTableCount();
        this.calculatePrice();
        this.updateFoodServiceSummary();
        this.beverageSelections = {};
        this.updateBeverageSummary();
    }

    // Update dashboard statistics
    updateDashboard() {
        const totalReservations = this.reservations.length;
        const totalRevenue = this.reservations.reduce((sum, res) => sum + res.pricing.totalCost, 0);
        const totalGuests = this.reservations.reduce((sum, res) => sum + res.guestCount, 0);
        
        // Today's reservations
        const today = new Date().toISOString().split('T')[0];
        const todayReservations = this.reservations.filter(res => res.eventDate === today).length;

        // Update stats
        document.getElementById('totalReservations').textContent = totalReservations;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('totalGuests').textContent = totalGuests;
        document.getElementById('todayReservations').textContent = todayReservations;

        // Update recent reservations
        this.updateRecentReservations();
        
        // Update upcoming events
        this.updateUpcomingEvents();
    }

    // Update recent reservations
    updateRecentReservations() {
        const container = document.getElementById('recentReservations');
        const recent = this.reservations
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<p class="empty-state">No reservations yet</p>';
            return;
        }

        container.innerHTML = recent.map(reservation => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <strong>${reservation.clientName}</strong>
                    <span>${new Date(reservation.eventDate).toLocaleDateString()} at ${this.formatTime12Hour(reservation.eventTime)}</span>
                </div>
                <div class="recent-item-price">$${reservation.pricing.totalCost.toFixed(2)}</div>
            </div>
        `).join('');
    }

    // Update upcoming events
    updateUpcomingEvents() {
        const container = document.getElementById('upcomingEvents');
        const today = new Date();
        const upcoming = this.reservations
            .filter(res => new Date(res.eventDate) >= today)
            .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
            .slice(0, 5);

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="empty-state">No upcoming events</p>';
            return;
        }

        container.innerHTML = upcoming.map(reservation => `
            <div class="upcoming-item">
                <div class="upcoming-item-info">
                    <strong>${reservation.clientName}</strong>
                    <span>${new Date(reservation.eventDate).toLocaleDateString()} at ${this.formatTime12Hour(reservation.eventTime)}</span>
                </div>
                <div class="upcoming-item-room">${this.getRoomDisplayName(reservation.roomType)}</div>
            </div>
        `).join('');
    }

    // Display calendar view
    displayCalendar() {
        const container = document.getElementById('calendarView');
        const monthYearElement = document.getElementById('calendarMonthYear');
        const today = new Date();
        
        // Get first day of month and number of days
        const firstDay = new Date(this.currentCalendarYear, this.currentCalendarMonth, 1);
        const lastDay = new Date(this.currentCalendarYear, this.currentCalendarMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();

        // Create calendar header
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Update month/year display
        monthYearElement.textContent = `${monthNames[this.currentCalendarMonth]} ${this.currentCalendarYear}`;

        let calendarHTML = `
            <div class="calendar-days-header">
                ${dayNames.map(day => `<div class="calendar-day-header">${day}</div>`).join('')}
            </div>
        `;

        // Create calendar grid (42 cells = 6 weeks)
        for (let i = 0; i < 42; i++) {
            const dayNumber = i - startDay + 1;
            const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
            const isToday = isCurrentMonth && 
                           dayNumber === today.getDate() && 
                           this.currentCalendarMonth === today.getMonth() && 
                           this.currentCalendarYear === today.getFullYear();
            
            if (isCurrentMonth) {
                const dateStr = `${this.currentCalendarYear}-${String(this.currentCalendarMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                const dayReservations = this.reservations.filter(res => res.eventDate === dateStr);
                
                calendarHTML += `
                    <div class="calendar-day ${isToday ? 'today' : ''}">
                        <div class="calendar-day-number">${dayNumber}</div>
                        ${dayReservations.map(res => `
                            <div class="calendar-event" onclick="reservationManager.showReservationDetails('${res.id}')">
                                ${res.clientName} - ${this.formatTime12Hour(res.eventTime)}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                calendarHTML += '<div class="calendar-day empty"></div>';
            }
        }

        container.innerHTML = calendarHTML;
    }

    // Navigate to previous month
    previousMonth() {
        this.currentCalendarMonth--;
        if (this.currentCalendarMonth < 0) {
            this.currentCalendarMonth = 11;
            this.currentCalendarYear--;
        }
        this.displayCalendar();
    }

    // Navigate to next month
    nextMonth() {
        this.currentCalendarMonth++;
        if (this.currentCalendarMonth > 11) {
            this.currentCalendarMonth = 0;
            this.currentCalendarYear++;
        }
        this.displayCalendar();
    }

    // Update analytics
    updateAnalytics() {
        this.updateRoomStats();
        this.updateGuestStats();
    }

    // Update room statistics
    updateRoomStats() {
        const container = document.getElementById('roomStats');
        const roomCounts = {};
        
        this.reservations.forEach(res => {
            roomCounts[res.roomType] = (roomCounts[res.roomType] || 0) + 1;
        });

        const roomNames = {
            'grand-hall': 'Salon 1',
            'intimate-room': 'Salon 2',
            'outdoor-terrace': 'Salon 3'
        };

        container.innerHTML = Object.entries(roomCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([room, count]) => `
                <div class="stat-item">
                    <span>${roomNames[room] || room}</span>
                    <strong>${count} events</strong>
                </div>
            `).join('');
    }

    // Update guest statistics
    updateGuestStats() {
        const container = document.getElementById('guestStats');
        const totalGuests = this.reservations.reduce((sum, res) => sum + res.guestCount, 0);
        const avgGuests = this.reservations.length > 0 ? totalGuests / this.reservations.length : 0;
        const maxGuests = Math.max(...this.reservations.map(res => res.guestCount), 0);
        const minGuests = Math.min(...this.reservations.map(res => res.guestCount), 0);

        container.innerHTML = `
            <h4>${avgGuests.toFixed(1)}</h4>
            <p>Average guests per event</p>
            <div class="stats-details">
                <div>Max: ${maxGuests} guests</div>
                <div>Min: ${minGuests} guests</div>
                <div>Total: ${totalGuests} guests</div>
            </div>
        `;
    }

    // Show reservation details
    showReservationDetails(id) {
        const reservation = this.reservations.find(r => r.id === id);
        if (!reservation) return;
        
        const modal = document.getElementById('reservationDetailsModal');
        const body = document.getElementById('reservationDetailsBody');
        
        // Format date
        const eventDate = new Date(reservation.eventDate + 'T00:00:00');
        const formattedDate = eventDate.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Build reservation details HTML
        let detailsHTML = `
            <div class="reservation-details-content">
                <div class="detail-section">
                    <h4><i class="fas fa-user"></i> Información del Cliente</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Nombre:</span>
                            <span class="detail-value">${reservation.clientName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Correo Electrónico:</span>
                            <span class="detail-value">${reservation.clientEmail}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Teléfono:</span>
                            <span class="detail-value">${reservation.clientPhone}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-calendar-alt"></i> Detalles del Evento</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Tipo de Evento:</span>
                            <span class="detail-value">${reservation.eventType || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Fecha:</span>
                            <span class="detail-value">${formattedDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Hora:</span>
                            <span class="detail-value">${this.formatTime12Hour(reservation.eventTime)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Duración:</span>
                            <span class="detail-value">${reservation.eventDuration} horas</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-building"></i> Espacio e Invitados</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Espacio del Evento:</span>
                            <span class="detail-value">${this.getRoomDisplayName(reservation.roomType)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Número de Invitados:</span>
                            <span class="detail-value">${reservation.guestCount}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Configuración de Mesas:</span>
                            <span class="detail-value">${reservation.tableConfiguration.tableCount || 0} mesas (${reservation.tableConfiguration.seatsPerTable || 'N/A'} asientos cada una)</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-utensils"></i> Comida y Bebidas</h4>
                    <div class="food-beverage-content">
                        <div class="food-service-section">
                            <span class="detail-label">Servicio de Comida:</span>
                            <span class="detail-value">${this.getFoodDisplayName(reservation.foodType)}</span>
                            ${this.isBuffet(reservation.foodType) && reservation.buffet ? `
                            <ul class="detail-bullet-list">
                                ${reservation.buffet.rice ? `<li>${this.getBuffetItemName('rice', reservation.buffet.rice)}</li>` : ''}
                                ${reservation.buffet.protein1 ? `<li>${this.getBuffetItemName('protein', reservation.buffet.protein1)}</li>` : ''}
                                ${reservation.buffet.protein2 ? `<li>${this.getBuffetItemName('protein', reservation.buffet.protein2)}</li>` : ''}
                                ${reservation.buffet.side ? `<li>${this.getBuffetItemName('side', reservation.buffet.side)}</li>` : ''}
                                ${reservation.buffet.salad ? `<li>${this.getBuffetItemName('salad', reservation.buffet.salad)}</li>` : ''}
                            </ul>
                            ` : ''}
                        </div>
                        <div class="beverage-section">
                            <span class="detail-label">Bebidas:</span>
                            ${this.getBeverageBulletList(reservation.beverages)}
                        </div>
                    </div>
                </div>
                
                ${Object.values(reservation.additionalServices).some(v => v) ? `
                <div class="detail-section">
                    <h4><i class="fas fa-plus-circle"></i> Servicios Adicionales</h4>
                    <div class="detail-grid">
                        ${Object.entries(reservation.additionalServices)
                            .filter(([key, value]) => value)
                            .map(([key, value]) => `
                                <div class="detail-item">
                                    <span class="detail-label">Servicio:</span>
                                    <span class="detail-value">${this.getServiceName(key)}</span>
                                </div>
                            `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="detail-section pricing-section">
                    <h4><i class="fas fa-calculator"></i> Resumen de Precios</h4>
                    <div class="pricing-breakdown-modal">
                        <div class="pricing-row">
                            <span>Espacio del Evento:</span>
                            <span>$${reservation.pricing.roomCost.toFixed(2)}</span>
                        </div>
                        <div class="pricing-row">
                            <span>Servicio de Comida:</span>
                            <span>$${reservation.pricing.foodCost.toFixed(2)}</span>
                        </div>
                        <div class="pricing-row">
                            <span>Servicio de Bebidas:</span>
                            <span>$${reservation.pricing.drinkCost.toFixed(2)}</span>
                        </div>
                        <div class="pricing-row">
                            <span>Servicios Adicionales:</span>
                            <span>$${reservation.pricing.additionalCost.toFixed(2)}</span>
                        </div>
                        <div class="pricing-row">
                            <span>Impuestos:</span>
                            <span>$${reservation.pricing.taxes.totalTaxes.toFixed(2)}</span>
                        </div>
                        ${reservation.pricing.tip && reservation.pricing.tip.amount > 0 ? `
                        <div class="pricing-row">
                            <span>Propina (${reservation.pricing.tip.percentage}%):</span>
                            <span>$${reservation.pricing.tip.amount.toFixed(2)}</span>
                        </div>
                        ` : ''}
                        <div class="pricing-row total-row">
                            <span>Costo Total:</span>
                            <span>$${reservation.pricing.totalCost.toFixed(2)}</span>
                        </div>
                        ${reservation.pricing.depositAmount > 0 ? `
                        <div class="pricing-row deposit-row">
                            <span>Depósito (20%):</span>
                            <span>
                                $${reservation.pricing.depositAmount.toFixed(2)}
                                <span class="deposit-status-toggle ${reservation.depositPaid ? 'paid' : 'unpaid'}" onclick="reservationManager.toggleDepositStatus('${reservation.id}')" data-reservation-id="${reservation.id}">
                                    ${reservation.depositPaid ? '✓ Pagado' : 'No Pagado'}
                                </span>
                            </span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        body.innerHTML = detailsHTML;
        this.openReservationDetailsModal();
    }

    getServiceName(key) {
        const serviceNames = {
            'audioVisual': 'Manteles',
            'decorations': 'Basic Decorations',
            'waitstaff': 'Additional Waitstaff',
            'valet': 'Valet Parking'
        };
        return serviceNames[key] || key;
    }

    getBuffetItemName(type, value) {
        const names = {
            rice: {
                'cebolla': 'Arroz Cebolla',
                'cilantro': 'Arroz Cilantro',
                'mamposteado': 'Arroz Mamposteado',
                'consomme': 'Arroz Consommé',
                'griego': 'Arroz Griego',
                'gandules': 'Arroz con Gandules'
            },
            protein: {
                'pechuga-cilantro': 'Pechuga salsa Cilantro',
                'pechuga-tres-quesos': 'Pechuga tres quesos',
                'pechuga-ajillo': 'Pechuga Ajillo',
                'pavo-cranberry': 'Filete Pavo Frito salsa cranberry',
                'medallones-guayaba': 'Medallones salsa Guayaba',
                'pernil-asado': 'Pernil Asado',
                'pescado-ajillo': 'Filete de Pescado Ajillo',
                'churrasco-setas': 'Churrasco salsa setas'
            },
            side: {
                'papas-leonesa': 'Papas Leonesa',
                'papas-salteadas': 'Papas salteadas',
                'ensalada-papa': 'Ensalada Papa',
                'ensalada-coditos': 'Ensalada de coditos'
            },
            salad: {
                'caesar': 'Caesar Salad',
                'verde': 'Ensalada Verde'
            }
        };
        return names[type]?.[value] || value;
    }

    getBeverageBulletList(beveragesMap) {
        if (!beveragesMap || Object.keys(beveragesMap).length === 0) {
            return '<span class="detail-value">None</span>';
        }
        const items = this.getBeverageItems();
        const beverageList = Object.entries(beveragesMap)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => {
                const item = items.find(i => i.id === id);
                return `<li>${qty} x ${item ? item.name : id}</li>`;
            });
        return beverageList.length > 0 
            ? `<ul class="detail-bullet-list">${beverageList.join('')}</ul>`
            : '<span class="detail-value">None</span>';
    }

    openReservationDetailsModal() {
        const modal = document.getElementById('reservationDetailsModal');
        if (!modal) return;
        modal.classList.remove('hidden');
        void modal.offsetWidth;
        modal.classList.add('visible');
    }

    closeReservationDetailsModal() {
        const modal = document.getElementById('reservationDetailsModal');
        if (!modal) return;
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 220);
    }

    toggleDepositStatus(id) {
        const reservation = this.reservations.find(r => r.id === id);
        if (!reservation) return;
        
        // Toggle the status
        reservation.depositPaid = !reservation.depositPaid;
        
        // Save to localStorage
        this.saveReservations();
        
        // Update displays
        this.displayReservations();
        
        // If modal is open, refresh it
        const modal = document.getElementById('reservationDetailsModal');
        if (modal && !modal.classList.contains('hidden')) {
            this.showReservationDetails(id);
        }
        
        // Show notification
        this.showNotification(
            `Depósito marcado como ${reservation.depositPaid ? 'Pagado' : 'No Pagado'}`,
            'success'
        );
    }

    // Display reservations
    displayReservations() {
        const container = document.getElementById('reservationsContainer');
        
        if (this.reservations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Aún no hay reservaciones</h3>
                    <p>Cree su primera reservación usando el formulario.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.reservations.map(reservation => `
            <div class="reservation-card">
                <div class="reservation-header">
                    <div class="reservation-client">${reservation.clientName}</div>
                    <div class="reservation-total">$${reservation.pricing.totalCost.toFixed(2)}</div>
                </div>
                <div class="reservation-details">
                    <div class="reservation-detail">
                        <strong>Fecha:</strong>
                        <span>${new Date(reservation.eventDate).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Hora:</strong>
                        <span>${this.formatTime12Hour(reservation.eventTime)}</span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Duración:</strong>
                        <span>${reservation.eventDuration} horas</span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Salón:</strong>
                        <span>${this.getRoomDisplayName(reservation.roomType)}</span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Invitados:</strong>
                        <span>${reservation.guestCount}</span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Comida:</strong>
                        <span>${this.getFoodDisplayName(reservation.foodType)}</span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Bebidas:</strong>
                        <span>${this.getBeverageSummaryString(reservation.beverages)}</span>
                    </div>
                    <div class="reservation-detail">
                        <strong>Contacto:</strong>
                        <span>${reservation.clientPhone}</span>
                    </div>
                    ${reservation.pricing.depositAmount > 0 ? `
                    <div class="reservation-detail">
                        <strong>Depósito:</strong>
                        <span>
                            $${reservation.pricing.depositAmount.toFixed(2)}
                            <span class="deposit-status-toggle ${reservation.depositPaid ? 'paid' : 'unpaid'}" onclick="reservationManager.toggleDepositStatus('${reservation.id}')" data-reservation-id="${reservation.id}">
                                ${reservation.depositPaid ? '✓ Pagado' : 'No Pagado'}
                            </span>
                        </span>
                    </div>
                    ` : ''}
                </div>
                ${this.getTableConfigurationDisplay(reservation.tableConfiguration)}
                ${this.getAdditionalServicesDisplay(reservation.additionalServices)}
                <div class="reservation-actions">
                    <button class="btn btn-small btn-primary" onclick="reservationManager.exportReservationInvoice('${reservation.id}')">
                        <i class="fas fa-file-invoice"></i> Exportar Factura
                    </button>
                    <button class="btn btn-small btn-outline" onclick="reservationManager.editReservation('${reservation.id}')">
                        Editar
                    </button>
                    <button class="btn btn-small btn-danger" onclick="reservationManager.deleteReservation('${reservation.id}')">
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Get display names for dropdown values
    getRoomDisplayName(roomType) {
        const roomNames = {
            'grand-hall': 'Salon 1',
            'intimate-room': 'Salon 2',
            'outdoor-terrace': 'Salon 3'
        };
        return roomNames[roomType] || roomType;
    }

    getFoodDisplayName(foodType) {
        if (this.isBuffet(foodType)) return 'Buffet';
        const foodNames = {
            'individual-plates': 'Platos Individuales',
            'cocktail-reception': 'Recepción de Cóctel',
            'no-food': 'Sin Servicio de Comida'
        };
        return foodNames[foodType] || foodType;
    }

    getDrinkDisplayName(drinkType) {
        // Deprecated with modal multi-select
        return '—';
    }

    getBeverageSummaryString(beveragesMap) {
        if (!beveragesMap || Object.keys(beveragesMap).length === 0) return 'Sin Servicio de Bebidas';
        const items = this.getBeverageItems();
        const parts = Object.entries(beveragesMap)
            .filter(([, qty]) => qty > 0)
            .map(([id, qty]) => {
                const item = items.find(i => i.id === id);
                return `${qty} x ${item ? item.name : id}`;
            });
        return parts.length ? parts.join(', ') : 'Sin Servicio de Bebidas';
    }

    // Get table configuration display
    getTableConfigurationDisplay(tableConfig) {
        if (!tableConfig || !tableConfig.tableType) return '';

        const tableTypeNames = {
            'round-8': 'Round Tables (8 seats)',
            'round-10': 'Round Tables (10 seats)',
            'round-12': 'Round Tables (12 seats)',
            'rectangular-6': 'Rectangular Tables (6 seats)',
            'rectangular-8': 'Rectangular Tables (8 seats)',
            'rectangular-10': 'Rectangular Tables (10 seats)',
            'custom': `Custom Tables (${tableConfig.seatsPerTable} seats)`
        };

        const tableTypeName = tableTypeNames[tableConfig.tableType] || tableConfig.tableType;
        const tableCount = tableConfig.tableCount || 0;

        return `
            <div class="reservation-detail">
                <strong>Table Setup:</strong>
                <span>${tableTypeName} - ${tableCount} tables needed</span>
            </div>
        `;
    }

    // Get additional services display
    getAdditionalServicesDisplay(services) {
        const activeServices = Object.entries(services)
            .filter(([key, value]) => value)
            .map(([key, value]) => {
                const serviceNames = {
                    'audioVisual': 'Manteles',
                    'decorations': 'Basic Decorations',
                    'waitstaff': 'Additional Waitstaff',
                    'valet': 'Valet Parking'
                };
                return serviceNames[key] || key;
            });

        if (activeServices.length === 0) return '';

        return `
            <div class="reservation-detail">
                <strong>Servicios Adicionales:</strong>
                <span>${activeServices.join(', ')}</span>
            </div>
        `;
    }

    // Edit reservation
    editReservation(id) {
        const reservation = this.reservations.find(r => r.id === id);
        if (!reservation) return;

        // Navigate to the reservation form section for editing
        this.showSection('new-reservation');

        // Populate form with reservation data
        document.getElementById('clientName').value = reservation.clientName;
        document.getElementById('clientEmail').value = reservation.clientEmail;
        document.getElementById('clientPhone').value = reservation.clientPhone;
        document.getElementById('eventDate').value = reservation.eventDate;
        document.getElementById('eventTime').value = reservation.eventTime;
        
        // Handle event type - check if it's a standard option or "other"
        const standardEventTypes = ['wedding', 'birthdays', 'pharmaceutical', 'baptism', 'graduation'];
        const eventTypeValue = reservation.eventType || '';
        if (standardEventTypes.includes(eventTypeValue)) {
            document.getElementById('eventType').value = eventTypeValue;
        } else {
            // It's a custom event type, set to "other" and populate the other field
            document.getElementById('eventType').value = 'other';
            document.getElementById('otherEventType').value = eventTypeValue;
            this.handleEventTypeChange(); // This will show the otherEventType field
        }
        
        document.getElementById('eventDuration').value = reservation.eventDuration;
        document.getElementById('roomType').value = reservation.roomType;
        document.getElementById('foodType').value = reservation.foodType;
        // no drinkType select anymore
        this.beverageSelections = reservation.beverages || {};
        this.updateBeverageSummary();
        document.getElementById('guestCount').value = reservation.guestCount;

        // Populate buffet modal fields (do not open the modal)
        if (this.isBuffet(reservation.foodType)) {
            const buffet = reservation.buffet || {};
            const riceEl = document.getElementById('buffetRice');
            const p1El = document.getElementById('buffetProtein1');
            const p2El = document.getElementById('buffetProtein2');
            const sideEl = document.getElementById('buffetSide');
            const saladEl = document.getElementById('buffetSalad');
            if (riceEl) riceEl.value = buffet.rice || '';
            if (p1El) p1El.value = buffet.protein1 || '';
            if (p2El) p2El.value = buffet.protein2 || '';
            if (sideEl) sideEl.value = buffet.side || '';
            if (saladEl) saladEl.value = buffet.salad || '';
        } else {
            this.clearBuffetSelections();
        }

        // Set additional services checkboxes
        Object.entries(reservation.additionalServices).forEach(([service, checked]) => {
            const checkbox = document.getElementById(service);
            if (checkbox) {
                checkbox.checked = checked;
            }
        });

        // Restore tip percentage
        const tipPercentage = reservation.tipPercentage || 0;
        const tipPercentageEl = document.getElementById('tipPercentage');
        if (tipPercentageEl) {
            tipPercentageEl.value = tipPercentage.toString();
        }

        // Update displays
        this.updateGuestCountDisplay();
        this.calculatePrice();
        this.updateFoodServiceSummary();

        // Remove the reservation from the list (will be re-added when saved)
        this.reservations = this.reservations.filter(r => r.id !== id);
        this.saveReservations();
        this.displayReservations();

        // Scroll to form
        document.querySelector('.reservation-form').scrollIntoView({ behavior: 'smooth' });
    }

    // Delete reservation
    deleteReservation(id) {
        if (confirm('¿Está seguro de que desea eliminar esta reservación?')) {
            this.reservations = this.reservations.filter(r => r.id !== id);
            this.saveReservations();
            this.displayReservations();
            this.showNotification('¡Reservación eliminada exitosamente!', 'success');
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : '#F27B21'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Local storage methods
    saveReservations() {
        localStorage.setItem('antesalaReservations', JSON.stringify(this.reservations));
    }

    loadReservations() {
        const saved = localStorage.getItem('antesalaReservations');
        return saved ? JSON.parse(saved) : [];
    }

    // Export reservation as invoice
    async exportReservationInvoice(id) {
        const reservation = this.reservations.find(r => r.id === id);
        if (!reservation) return;

        // Convert logo to base64 for embedding
        let logoBase64 = '';
        try {
            const response = await fetch('Logo Antesala.webp');
            const blob = await response.blob();
            logoBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn('Could not load logo image:', error);
            // Fallback to a placeholder or empty string
            logoBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI3NSIgY3k9Ijc1IiByPSI3MCIgZmlsbD0iI0ZFRUI4NCIgc3Ryb2tlPSIjRjI3QjIxIiBzdHJva2Utd2lkdGg9IjQiLz48L3N2Zz4='; // Placeholder circle
        }

        // Format date
        const eventDate = new Date(reservation.eventDate + 'T00:00:00');
        const formattedDate = eventDate.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        // Generate invoice number (based on year and reservation index)
        const reservationIndex = this.reservations.findIndex(r => r.id === reservation.id) + 1;
        const invoiceNumber = `${new Date().getFullYear()}-${String(reservationIndex).padStart(3, '0')}`;

        // Build itemized list
        let itemsHTML = '';
        
        // Food items
        if (this.isBuffet(reservation.foodType) && reservation.buffet) {
            const buffetItems = [];
            if (reservation.buffet.rice) buffetItems.push(this.getBuffetItemName('rice', reservation.buffet.rice));
            if (reservation.buffet.protein1) buffetItems.push(this.getBuffetItemName('protein', reservation.buffet.protein1));
            if (reservation.buffet.protein2) buffetItems.push(this.getBuffetItemName('protein', reservation.buffet.protein2));
            if (reservation.buffet.side) buffetItems.push(this.getBuffetItemName('side', reservation.buffet.side));
            if (reservation.buffet.salad) buffetItems.push(this.getBuffetItemName('salad', reservation.buffet.salad));
            
            // Calculate price per item (divide total food cost equally among items)
            const pricePerItem = buffetItems.length > 0 ? reservation.pricing.foodCost / buffetItems.length : reservation.pricing.foodCost;
            
            // List each buffet item with guest count and distributed price
            buffetItems.forEach(itemName => {
                itemsHTML += `
                    <tr>
                        <td>${itemName}</td>
                        <td>${reservation.guestCount}</td>
                        <td>$${pricePerItem.toFixed(2)}</td>
                    </tr>
                `;
            });
        } else if (reservation.pricing.foodCost > 0) {
            itemsHTML += `
                <tr>
                    <td>${this.getFoodDisplayName(reservation.foodType)}</td>
                    <td>${reservation.guestCount}</td>
                    <td>$${reservation.pricing.foodCost.toFixed(2)}</td>
                </tr>
            `;
        }

        // Beverages
        if (reservation.beverages && Object.keys(reservation.beverages).length > 0) {
            const items = this.getBeverageItems();
            Object.entries(reservation.beverages).forEach(([id, qty]) => {
                if (qty > 0) {
                    const item = items.find(i => i.id === id);
                    if (item) {
                        const total = item.price * qty;
                        itemsHTML += `
                            <tr>
                                <td>${item.name}</td>
                                <td>${qty}</td>
                                <td>$${total.toFixed(2)}</td>
                            </tr>
                        `;
                    }
                }
            });
        }

        // Event space (if applicable)
        if (reservation.pricing.roomCost > 0) {
            itemsHTML += `
                <tr>
                    <td>${this.getRoomDisplayName(reservation.roomType)} - ${reservation.eventDuration} hours</td>
                    <td>1</td>
                    <td>$${reservation.pricing.roomCost.toFixed(2)}</td>
                </tr>
            `;
        }

        // Additional services - get individual prices
        const servicePrices = {
            'audioVisual': 0, // Manteles has no cost
            'decorations': 150,
            'waitstaff': 100,
            'valet': 50
        };
        
        let additionalServicesTotal = 0;
        Object.entries(reservation.additionalServices).forEach(([key, value]) => {
            if (value) {
                const serviceName = this.getServiceName(key);
                const servicePrice = servicePrices[key] || 0;
                additionalServicesTotal += servicePrice;
                if (servicePrice > 0) {
                    itemsHTML += `
                        <tr>
                            <td>${serviceName}</td>
                            <td>1</td>
                            <td>$${servicePrice.toFixed(2)}</td>
                        </tr>
                    `;
                } else {
                    itemsHTML += `
                        <tr>
                            <td>${serviceName}</td>
                            <td>1</td>
                            <td>Incluido</td>
                        </tr>
                    `;
                }
            }
        });

        // Calculate subtotal (before taxes) - use actual additional services total
        const subtotal = reservation.pricing.roomCost + reservation.pricing.foodCost + reservation.pricing.drinkCost + additionalServicesTotal;
        
        // Calculate balance
        const balance = reservation.pricing.totalCost - reservation.pricing.depositAmount;

        // Create invoice HTML
        const invoiceHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceNumber} - La Antesala</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            padding: 40px 20px;
            background: #f5f5f5;
            color: #333;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo-area {
            width: 150px;
            height: 150px;
            margin: 0 auto 20px;
            border-radius: 50%;
            background: #FEEB84;
            border: 4px solid #F27B21;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            overflow: hidden;
        }
        .logo-area img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2d3748;
        }
        .company-info {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
        }
        .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }
        .client-info, .invoice-info {
            flex: 1;
        }
        .client-info {
            padding-right: 20px;
        }
        .invoice-info {
            text-align: right;
        }
        .section-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 8px;
            color: #2d3748;
        }
        .info-line {
            font-size: 13px;
            margin-bottom: 5px;
            color: #4a5568;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        .items-table th {
            background: #2d3748;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
        }
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
        }
        .items-table tr:last-child td {
            border-bottom: 2px solid #2d3748;
        }
        .items-table td:last-child,
        .items-table th:last-child {
            text-align: right;
        }
        .financial-summary {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
        }
        .financial-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
        }
        .financial-row.total {
            font-weight: bold;
            font-size: 18px;
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
        }
        .financial-row.deposit {
            font-weight: bold;
            font-size: 16px;
            color: #F27B21;
            margin-top: 10px;
        }
        .financial-row.balance {
            font-weight: bold;
            font-size: 16px;
            color: #48bb78;
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
        }
        .terms {
            margin-top: 40px;
            padding: 20px;
            background: #f8fafc;
            border-left: 4px solid #F27B21;
            font-size: 11px;
            line-height: 1.8;
            color: #4a5568;
        }
        .footer {
            text-align: right;
            margin-top: 30px;
            font-weight: bold;
            color: #F27B21;
            font-size: 16px;
        }
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .invoice-container {
                box-shadow: none;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="logo-area">
                <img src="${logoBase64}" alt="LA ANTESALA" style="max-width: 100%; height: auto; border-radius: 50%;">
            </div>
            <div class="company-name">LA ANTESALA BY FUSION</div>
            <div class="company-info">
                Avenida Hostos 105, Ponce, PR 00717<br>
                Tel. 787-428-2228
            </div>
        </div>

        <div class="invoice-header">
            <div class="client-info">
                <div class="section-title">ISSUED TO:</div>
                <div class="info-line">A: ${reservation.clientName}</div>
                <div class="info-line">Tel: ${reservation.clientPhone}</div>
                <div style="margin-top: 15px;">
                    <div class="info-line"><strong>Actividad:</strong> ${reservation.eventType || 'Evento'}</div>
                    <div class="info-line"><strong>Día:</strong> ${formattedDate}</div>
                    <div class="info-line"><strong>Hora:</strong> ${this.formatTime12Hour(reservation.eventTime)}</div>
                </div>
            </div>
            <div class="invoice-info">
                <div class="section-title">INVOICE NO:</div>
                <div class="info-line" style="font-size: 18px; font-weight: bold;">${invoiceNumber}</div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>DESCRIPTION</th>
                    <th>QTY</th>
                    <th>TOTAL</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>

        <div class="financial-summary">
            <div class="financial-row">
                <span>SUB-TOTAL</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="financial-row">
                <span>TAXES AND FEE</span>
                <span>$${reservation.pricing.taxes.totalTaxes.toFixed(2)}</span>
            </div>
            ${reservation.pricing.tip && reservation.pricing.tip.amount > 0 ? `
            <div class="financial-row">
                <span>PROPINA ${reservation.pricing.tip.percentage}%</span>
                <span>$${reservation.pricing.tip.amount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="financial-row total">
                <span>SUB TOTAL</span>
                <span>$${reservation.pricing.totalCost.toFixed(2)}</span>
            </div>
            <div class="financial-row deposit">
                <span>DEPOSITO 20%</span>
                <span>$${reservation.pricing.depositAmount.toFixed(2)} ${reservation.depositPaid ? '✓ PAID' : ''}</span>
            </div>
            <div class="financial-row balance">
                <span>SALDO</span>
                <span>$${balance.toFixed(2)}</span>
            </div>
        </div>

        <div class="terms">
            <strong>TÉRMINOS Y CONDICIONES:</strong><br>
            PARA SEPARAR EL SALÓN SE REQUIERE EL 20% DEL TOTAL DE LA COTIZACIÓN, NO ES RE-EMBOLZABLE, TRANSFERIBLE A OTRA FECHA SI YA EL DIA DE LA FECHA INICIAL YA PASO, NO SE PUEDE UTILIZAR EN EL RESTAURANTE COMO CREDITO. -SALÓN SERÁ ENTREGADO 2 HORAS ANTES PARA FINES DE DECORACIÓN. NO SE PERMITE EL USO DE CONFETTI O PIROTECNIA DENTRO DEL SALON. NO PEGAR TAPE EN LAS PAREDES.
        </div>

        <div class="footer">
            THANK YOU
        </div>
    </div>
</body>
</html>
        `;

        // Create and download the HTML file
        const blob = new Blob([invoiceHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${invoiceNumber}-${reservation.clientName.replace(/\s+/g, '-')}.html`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('¡Factura exportada exitosamente!', 'success');
    }

    // Export reservations (bonus feature)
    exportReservations() {
        const dataStr = JSON.stringify(this.reservations, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `antesala-reservations-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the reservation manager when the page loads
let reservationManager;
document.addEventListener('DOMContentLoaded', () => {
    reservationManager = new ReservationManager();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').min = today;
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    document.getElementById('saveBtn').click();
                    break;
                case 'Enter':
                    e.preventDefault();
                    document.getElementById('calculateBtn').click();
                    break;
            }
        }
    });
});

// Global functions for HTML onclick handlers
function showSection(sectionId) {
    if (reservationManager) {
        reservationManager.showSection(sectionId);
    }
}

function clearForm() {
    if (reservationManager) {
        reservationManager.clearForm();
    }
}

function exportReservations() {
    if (reservationManager) {
        reservationManager.exportReservations();
    }
}

function previousMonth() {
    if (reservationManager) {
        reservationManager.previousMonth();
    }
}

function nextMonth() {
    if (reservationManager) {
        reservationManager.nextMonth();
    }
}