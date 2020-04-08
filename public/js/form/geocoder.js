console.log("formatting address")

const input = document.getElementById('unformattedAddress');

const formattedAddress = document.getElementById('formattedAddress')

async function getLocation(loc) {
    const res = await fetch(`/users/formatLocation/${loc}`);
    const data = await res.json();

    // console.log(data.data);
    return data.data;
}
    // console.log(data);
input.addEventListener('keyup', async (e) => {
    if (input.value === '') {
        formattedAddress.innerHTML = '';
        console.log('empty');
    }

    if (e.key && input.value !== '') {
        // console.log(e)
        try {
            data = await getLocation(input.value);
            
            // const res = await fetch(`/users/formatLocation/${textbox.value}`);
            formattedAddress.innerHTML = data;

            // console.log(data);
        } catch (e) {
            console.log(e);
        }
    }
});



