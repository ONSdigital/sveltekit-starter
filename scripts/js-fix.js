import path from "path";
import fs from "fs";

function throughDirectory(dir) {
    fs.readdirSync(dir).forEach(file => {
        const abs = path.join(dir, file);
        if (fs.statSync(abs).isDirectory()) return throughDirectory(abs);
        else return files.push(abs.replaceAll("\\", "/"));
    });
}

// Find all files in build/app folder
let files  = [];
throughDirectory("./build/_app/");
files = files.filter(file => file.slice(-3) == ".js");

files.forEach(file => {
    let str = fs.readFileSync(file);
    str = "//js\n" + str;
    fs.writeFileSync(file, str);
});
console.log(`Fixed ${files.length} JS files to avoid mimetype errors...`);