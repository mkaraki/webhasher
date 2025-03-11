import init, {calc_hash, list_hash_name} from './pkg/webhasher.js';

const result_table = document.getElementById("result-table");
const do_file_sum = document.getElementById("do-file-sum");
const file = document.getElementById("file");
const do_text_sum = document.getElementById("do-text-sum");
const new_line_selector = document.getElementById("new-line-selector");
const do_hex_sum = document.getElementById("do-hex-sum");
const do_list_all_supported = document.getElementById("list-all-supported");
const do_list_default_hash = document.getElementById("list-default-hash");
const use_hash_list  = document.getElementById("hash-to-use");
const result_time_info = document.getElementById("result-time-info");

const loading_overlay = document.getElementById("loading-overlay");

const crlf_convert = {
    "lf": "\n",
    "crlf": "\r\n",
    "cr": "\r"
};

async function run() {
    await init();

    const write_to_result_table = (hashes) => {
        result_table.innerHTML = "";

        let keys = Object.keys(hashes).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        keys.forEach((algorithm) => {
            const tr = document.createElement("tr");
            const th_algorithm = document.createElement("th");
            const td_hash = document.createElement("td");

            th_algorithm.textContent = algorithm;
            th_algorithm.setAttribute("scope", "row");
            td_hash.textContent = hashes[algorithm];

            tr.appendChild(th_algorithm);
            tr.appendChild(td_hash);

            result_table.appendChild(tr);
        });
    };

    const do_uint8_array_sum = (uint8_array) => {
        const hash_list = use_hash_list.value.split(';').filter((name) => name.length > 0).map((name) => name.trim());

        loading_overlay.classList.remove("hide");
        setTimeout(() => {
            const start_time = performance.now();
            const hashes = calc_hash(uint8_array, hash_list);
            const end_time = performance.now();
            write_to_result_table(hashes);
            result_time_info.textContent = `Time: ${Math.round(end_time - start_time).toLocaleString()} ms, ${hash_list.length.toLocaleString()} hash(es), ${uint8_array.length.toLocaleString()} byte(s)`;
            setTimeout(() => {
                loading_overlay.classList.add("hide");
            }, 0);
        }, 500);
    };

    do_file_sum.onclick = async () => {
        if (file.files.length < 1) {
            alert("Please select a file.");
            return;
        }
        loading_overlay.classList.remove("hide");
        const tgt_file = file.files[0];
        const buffer = await tgt_file.arrayBuffer();
        const uint8_array = new Uint8Array(buffer);
        do_uint8_array_sum(uint8_array);
    };

    do_text_sum.onclick = () => {
        loading_overlay.classList.remove("hide");
        let text = document.getElementById("text").value;
        text = text.replace(/\r\n|\r|\n/g, crlf_convert[new_line_selector.value]);
        const text_bytes = new TextEncoder().encode(text);
        const uint8_array = new Uint8Array(text_bytes);
        do_uint8_array_sum(uint8_array);
    };

    do_hex_sum.onclick = () => {
        let hex_text = document.getElementById("hex-text").value;
        hex_text = hex_text.replace(/(\s|\r|\n|\t)/g, "");
        if (hex_text.length % 2 !== 0) {
            alert("Invalid hex text.");
            return;
        }
        loading_overlay.classList.remove("hide");
        const hex_bytes = new Uint8Array(hex_text.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        do_uint8_array_sum(hex_bytes);
    };

    do_list_all_supported.onclick = () => {
        use_hash_list.value = list_hash_name().join(';');
    };

    const list_default = () => {
        use_hash_list.value = list_hash_name().filter((name) => {
            return ["CRC32C", "md5", "SHA-1", "SHA-256", "SHA-512", "Blake2b (512bit)", "Blake2s (256bit)", "SHA3-256", "SHA3-512"].includes(name);
        }).join(';');
    };
    do_list_default_hash.onclick = list_default;
    list_default();
}
run().then(r => {
    loading_overlay.classList.add("hide");
});
