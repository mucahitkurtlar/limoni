# ![Limoni Logo](icons/limoni-32.svg) Limoni - Ekşi Sözlük entry koleksiyonları

Limoni, Ekşi Sözlük entry koleksiyonları oluşturmanıza ve yönetmenize olanak tanıyan bir tarayıcı uzantısıdır. Entry'leri koleksiyonlara ekleyebilir, koleksiyonları düzenleyebilir ve dışa aktarabilirsiniz.

## Özellikler

- Koleksiyonlarınızı oluşturun
- Entry'leri koleksiyonlara ekleyin
- Koleksiyonlarınızı HTML, CSV veya JSON formatında dışa aktarın
- Verileriniz tarayıcınızda yerel olarak saklanır

## Başlarken

Adımları takip ederek Limoni'yi geliştirme ortamınızda çalıştırabilirsiniz.

### Gereksinimler

- [Bun](https://bun.sh)
- Firefox tarayıcı

### Kurulum

1. Depoyu klonlayın:

```bash
git clone https://github.com/mucahitkurtlar/limoni.git
cd limoni
```

2. Bağımlılıkları yükleyin:

```bash
bun install
```

3. Uzantıyı derleyin:

```bash
bun run build
```

4. Firefox'a yükleyin:
   - Firefox'u açın ve `about:debugging` sayfasına gidin
   - "Bu Firefox" seçeneğine tıklayın
   - "Geçici eklenti yükle..." butonuna tıklayın
   - `dist/manifest.json` dosyasını seçin

## Kullanım

### Koleksiyon Oluşturma

1. Firefox araç çubuğundaki ![Limoni simgesi](icons/limoni-16.svg) simgesine tıklayın
2. "Yeni" butonuna tıklayarak yeni bir koleksiyon oluşturun
3. Koleksiyonunuza bir isim ve isteğe bağlı olarak bir açıklama verin
4. "Oluştur" butonuna tıklayın

### Varsayılan Koleksiyonu Belirleme

1. Koleksiyonlarınız listesinden bir koleksiyon seçin
2. "Varsayılan yap" butonuna tıklayın

### Entry'leri Koleksiyonlara Ekleme

1. Ekşi Sözlük'te herhangi bir entry'nin altında bulunan "+ ekle" butonuna tıklayarak entry'yi varsayılan koleksiyonunuza ekleyin
2. Eğer entry'yi farklı bir koleksiyona eklemek istiyorsanız, "+ ekle" butonunun yanındaki açılır menüyü kullanarak istediğiniz koleksiyonu seçin
3. Entry başarıyla eklendiğinde, "+ ekle" butonu "✓ eklendi" olarak değişecektir

### Koleksiyonları Dışa Aktarma

1. Koleksiyonlarınız listesinden bir koleksiyon seçin
2. "Dışa Aktar" butonuna tıklayın
3. Dışa aktarmak istediğiniz formatı seçin (HTML, CSV veya JSON)
4. Dosya indirme işlemi başlayacaktır
5. PDF formatında dışa aktarmak için, koleksiyonunuzu HTML formatında dışa aktardıktan sonra, HTML dosyasını PDF'ye dönüştürmek için tarayıcının yazdırma özelliğini kullanabilirsiniz

### Bilinen Sorunlar/Geliştirme Planları

- [ ] Entry'leri koleksiyonlardan kaldırınca UI güncellenmiyor
- [ ] Yeni oluşturulan koleksiyonların açılır menüde görünmesi için sayfa yenilemek gerekiyor
- [x] Koleksiyon isim ve açıklamalarını düzenleme
- [ ] Karanlık tema desteği

## Lisans

Bu proje GNU General Public License v3.0 lisansı altında lisanslanmıştır. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına bakabilirsiniz.
