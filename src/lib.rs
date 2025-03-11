mod utils;

use tsify_next::{Tsify};
use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use hash_utils::all_hashers;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Tsify, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct HashNameAndHashMap(HashMap<String, String>);

#[wasm_bindgen]
pub fn calc_hash(data: Vec<u8>) -> HashNameAndHashMap {
    let hashers = all_hashers();
    let data = data.as_slice();
    let mut results: HashMap<String, String> = HashMap::new();

    for hasher in hashers {
        let hash_name = hasher.hash_name().parse().unwrap();
        let res = hasher.hash(data);
        let mut res_hex = String::new();
        for byte in res {
            res_hex.push_str(&format!("{:02x}", byte));
        }
        results.insert(hash_name, res_hex);
    }

    HashNameAndHashMap(results)
}
