const e = require('express');
const mysql = require('mysql2');
const puppeteer = require('puppeteer');

const db = mysql.createConnection({

    host: 'localhost',
    user: 'root',
    password: '',
    database: 'myDatabase'

});
// asenkron fonksyon olduğunu belirtir




async function asyncFuntionTitleAdd(){

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    var url = 'https://www.ruyatabirleri.com/yorum/harf/m#google_vignette';
    var titleClassName = '.singlebox';
        
    await page.goto(url);
    // $$ iki tane koyunca tüm elemanları almamıza yara eger tek $ kulllanırsak tek eleman almaya yarar.
   
    var elements = await page.$$(titleClassName);
    var a = 0;

    await Promise.all(elements.map(async(element) => {
        a+=1 ;
        //console.log(a);
        var reminingFiles = elements.length;
        const h2Element = await element.$('h2');
        // evaluate fonksyonu puppeteer mdulunde kullanılır taraıyıda calışan kodun sonucunu almak için kullanılır bunu kullanmadığım zaman ise asagıdaki yorumda olduğu gibi işe yaramadı
        const contentText = await h2Element.evaluate(el => el.textContent);
        console.log('contentText:', contentText);

        /* element = await element.$('h2');
        console.log('contentText:',element.textContent); */
        db.query('SELECT * FROM titles WHERE titleName = ?',[contentText],(err, result)=>{
            // return girdik cunku eger err donerse fonksyondan direkt cıksın ekstra diğer işlemler ile uğrasmasın
            if(err){
                console.log('sorgu sırsında bir hata olustu', err);
                return
            }
            if(result.length > 0){
                console.log(`title ${contentText} zaten mevcut`);
                reminingFiles--;
                if(reminingFiles === 0){
                    db.end((err) =>{
                        if(err){
                            console.log('Veritabanı kapatılırken sorun oluştu!');
                        }
                        else{
                            console.log('Veritabanı başarıyla kapatıldı!');
                        }
                    })
                }

            }
            else{
                // insert de VALUES (?) böyle select sorgusunda = ?  bu şekilde
                db.query('INSERT INTO titles (titleName) VALUES (?)', [contentText], (err, result) =>{

                    if(err){
                        console.log('Veritabaına kayıt basarisiz oldu',err);
                    }
                    else{
                        console.log(`${contentText} veritabanına kaydedildi`);
                    }

                    reminingFiles--;

                    if(reminingFiles === 0){
                        db.end((err) =>{
                            if(err){
                                console.log('Veritabanı kapatılırken sorun oluştu!')
                            }
                            else{
                                console.log('Veritabanı başarıyla kapatıldı!');
                            }
                        });
                    }

                });

            }
            


        });
    }))
    
    
    /* elements.forEach(async(element)=>{
            
        element = await element.$('h2');
        console.log('contentText:',element);

    }) */

    

}

asyncFuntionTitleAdd();
