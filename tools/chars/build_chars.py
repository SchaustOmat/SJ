# Blender (headless): Quaternius Universal Base Characters -> eine GLB mit Mann, Frau, Augen, Brauen, 8 Frisuren.
# Jede Datei behält ihre eigene Armature (eigene Bind-Pose); das Spiel bindet zur Laufzeit alles an EIN Skelett um.
# Texturen: Haut 1024, Haare/Augen 512, Normal/Roughness raus, Export als JPEG.
#   blender -b --python build_chars.py -- <ubc-ordner> <ziel.glb> [outfit-gltf-ordner]
import bpy,sys,os,glob
argv=sys.argv[sys.argv.index('--')+1:]
src,dst=argv[0],argv[1]
outfits=argv[2] if len(argv)>2 else None
bpy.ops.wm.read_factory_settings(use_empty=True)
def imp(path,tag):
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new=[o for o in bpy.data.objects if o not in before]
    arms=[o for o in new if o.type=='ARMATURE'];meshes=[o for o in new if o.type=='MESH']
    for a in arms:a.name='Arm_'+tag
    return arms,meshes
base=os.path.join(src,'Base Characters','Godot - UE')
# Mann
arms,meshes=imp(os.path.join(base,'Superhero_Male_FullBody.gltf'),'M')
for m in meshes:
    n=len(m.data.polygons)
    m.name='Body_M' if n>5000 else ('Eyes_M' if n<800 else 'Brows_M')
# Frau
arms,meshes=imp(os.path.join(base,'Superhero_Female_FullBody.gltf'),'F')
for m in meshes:
    n=len(m.data.polygons)
    m.name='Body_F' if n>5000 else ('Eyes_F' if n<800 else 'Brows_F')
# Frisuren und Brauen (an den Kopfknochen geskinnt)
hdir=os.path.join(src,'Hairstyles','Rigged to Head Bone','glTF (Godot -Unreal)')
for f in sorted(glob.glob(os.path.join(glob.escape(hdir),'*.gltf'))):
    tag=os.path.splitext(os.path.basename(f))[0]
    arms,meshes=imp(f,tag)
    for i,m in enumerate(meshes):m.name=tag if i==0 else tag+'_'+str(i)
# Outfits (optional): alle glTF im Ordner, Name = Dateiname
if outfits and os.path.isdir(outfits):
    for f in sorted(glob.glob(os.path.join(glob.escape(outfits),'**','*.gltf'),recursive=True)):
        tag='Out_'+os.path.splitext(os.path.basename(f))[0]
        arms,meshes=imp(f,tag)
        for i,m in enumerate(meshes):m.name=tag if i==0 else tag+'_'+str(i)
# Materialien aufräumen: nur das Base-Color-Bild behalten (Normal/Roughness raus), direkt an Base Color hängen
for mat in bpy.data.materials:
    if not mat.use_nodes:continue
    nt=mat.node_tree;bsdf=next((n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if not bsdf:continue
    base=None
    for n in list(nt.nodes):
        if n.type=='TEX_IMAGE' and n.image:
            nm=n.image.name.lower()
            if 'normal' in nm or 'rough' in nm or 'metal' in nm:nt.nodes.remove(n)
            elif base is None:base=n
            else:nt.nodes.remove(n)
        elif n.type in('NORMAL_MAP','BUMP','SEPARATE_COLOR','SEPRGB'):nt.nodes.remove(n)
    for name in ('Normal','Roughness','Metallic'):
        i2=bsdf.inputs.get(name)
        if i2 and i2.is_linked:
            for l in list(i2.links):nt.links.remove(l)
    if 'Roughness' in bsdf.inputs:bsdf.inputs['Roughness'].default_value=.85
    if 'Metallic' in bsdf.inputs:bsdf.inputs['Metallic'].default_value=0
    bc=bsdf.inputs.get('Base Color')
    if base and bc:
        for l in list(bc.links):nt.links.remove(l)
        nt.links.new(base.outputs['Color'],bc)
seen=set()
for img in bpy.data.images:
    if img.users==0 or img.size[0]==0:continue
    nm=img.name.lower()
    target=1024 if 'superhero' in nm else 512
    if img.size[0]>target:img.scale(target,int(img.size[1]*target/img.size[0]))
# nicht genutzte Bilder entfernen
for img in list(bpy.data.images):
    if img.users==0:bpy.data.images.remove(img)
objs=[(o.name,o.type,len(o.data.polygons) if o.type=='MESH' else len(o.data.bones)) for o in bpy.data.objects]
print('OBJEKTE',objs)
print('BILDER',[(i.name,i.size[0],i.size[1]) for i in bpy.data.images])
bpy.ops.export_scene.gltf(filepath=dst,export_format='GLB',export_animations=False,export_skins=True,export_apply=True,export_yup=True,export_image_format='JPEG',export_jpeg_quality=80,export_materials='EXPORT')
print('OK',dst,os.path.getsize(dst))
