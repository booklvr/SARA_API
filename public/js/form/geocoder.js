const textbox = document.getElementById('unformattedAddress');
const formattedAddress = document.getElementById('formattedAddress')

async function getLocation(loc) {
    const res = await fetch(`/users/formatLocation/${loc}`);
    const data = await res.json();

    console.log(data.data);

    return data.data;
}
    // console.log(data);
textbox.addEventListener('onkeyup', async (e) => {
    if (textbox.value === '') {
        formattedAddress.innerHTML = '';
        console.log('empty');
    }

    if (e.key && textbox.value !== '') {
        // console.log(e)
        try {
            data = await getLocation(textbox.value);
            
            // const res = await fetch(`/users/formatLocation/${textbox.value}`);
            formattedAddress.innerHTML = data;

            // console.log(data);
        } catch (e) {
            console.log(e);
        }
};



