# Antesala Reservations - Event Space Management System

A comprehensive web-based reservation management system for restaurant event spaces with real-time pricing calculations.

## Features

### 🏢 **Event Space Management**
- **Three Event Spaces**: Grand Hall, Intimate Room, and Outdoor Terrace
- **Flexible Pricing**: Hourly rates for each space ($300-$500/hour)
- **Duration Selection**: 2-8 hour booking options

### 👥 **Guest Management**
- **Smart Guest Counter**: Slider with 10-person intervals (10-200 guests)
- **Real-time Updates**: Guest count updates pricing instantly
- **Accommodation Planning**: Visual display of guest count

### 🍽️ **Food & Beverage Options**
- **Food Service Types**:
  - Buffet ($25/person)
  - Individual Plates ($35/person)
  - Cocktail Reception ($20/person)
  - No Food Service
- **Beverage Packages**:
  - Soft Drinks Only ($8/person)
  - Beer & Wine ($15/person)
  - Full Bar ($25/person)
  - Premium Bar ($35/person)
  - No Beverage Service

### 💰 **Real-Time Pricing System**
- **Instant Calculations**: Prices update automatically on every change
- **Detailed Breakdown**: Room rental, food, beverages, and additional services
- **Transparent Pricing**: Clear cost breakdown for clients
- **Total Cost Display**: Always visible current total

### 🎯 **Additional Services**
- Audio/Visual Equipment ($200)
- Basic Decorations ($150)
- Additional Waitstaff ($100)
- Valet Parking ($50)

### 📋 **Reservation Management**
- **Complete Client Information**: Name, email, phone
- **Event Details**: Date, time, duration
- **Reservation Storage**: Local browser storage for data persistence
- **Edit & Delete**: Full CRUD operations for reservations
- **Visual Cards**: Clean, organized reservation display

### 🎨 **Professional Interface**
- **Modern Design**: Clean, professional appearance
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Intuitive Navigation**: Easy-to-use form controls
- **Real-time Feedback**: Instant visual updates

## How to Use

### 1. **Creating a Reservation**
1. Fill in client information (name, email, phone)
2. Select event date and time
3. Choose event duration
4. Select your event space
5. Set guest count using the slider
6. Choose food service type
7. Select beverage package
8. Add any additional services
9. Review the real-time pricing summary
10. Click "Save Reservation"

### 2. **Managing Reservations**
- **View All**: All reservations appear in the right panel
- **Edit**: Click "Edit" to modify an existing reservation
- **Delete**: Click "Delete" to remove a reservation
- **Pricing**: All costs are calculated and displayed automatically

### 3. **Pricing Features**
- **Real-time Updates**: Every change instantly updates the total cost
- **Breakdown View**: See costs for room, food, drinks, and services separately
- **Transparent Pricing**: No hidden fees or surprises

## Technical Features

### 🔧 **Built With**
- **HTML5**: Semantic markup and form validation
- **CSS3**: Modern styling with gradients and animations
- **Vanilla JavaScript**: No external dependencies
- **Local Storage**: Data persistence in browser

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Easy interaction on mobile devices
- **Adaptive Layout**: Content adjusts to screen size

### ⚡ **Performance**
- **Fast Loading**: Lightweight, no external dependencies
- **Instant Updates**: Real-time calculations
- **Smooth Animations**: Professional user experience

## File Structure

```
AntesalaReservations/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and responsive design
├── script.js           # All functionality and interactions
└── README.md           # This documentation
```

## Getting Started

1. **Open the System**: Simply open `index.html` in any modern web browser
2. **No Installation Required**: Everything runs in the browser
3. **Data Storage**: Reservations are saved locally in your browser
4. **Cross-Platform**: Works on Windows, Mac, Linux, and mobile devices

## Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save current reservation
- **Ctrl/Cmd + Enter**: Calculate pricing

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Data Management

### **Local Storage**
- All reservations are stored in your browser's local storage
- Data persists between browser sessions
- No external servers or databases required

### **Export Feature**
- Export all reservations as JSON file
- Useful for backup or data transfer
- Access via browser console: `exportReservations()`

## Customization

### **Pricing Updates**
To modify pricing, edit the `data-price` attributes in `index.html`:

```html
<option value="grand-hall" data-price="500">Grand Hall - $500/hour</option>
```

### **Room Options**
Add new event spaces by adding options to the room selection dropdown.

### **Service Additions**
Add new services by including them in the additional services section.

## Support

This system is designed to be self-contained and easy to use. All functionality is built-in and requires no external setup or maintenance.

---

**Antesala Reservations** - Professional event space management made simple.
