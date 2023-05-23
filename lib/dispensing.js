

async function checkProductAvailabilityInMachine(machineId) {

}
async function dispenseProduct() {
    // Simulate dispensing by introducing a delay
    setTimeout(() => {
        console.log('Product dispensed.');
        // Update product availability after dispensing
        productAvailable = false;
    }, 2000); // Simulate a 2-second delay
}


module.exports = {
    dispenseProduct,

}
