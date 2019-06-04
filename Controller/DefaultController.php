<?php

namespace Youwe\MultiClonerBundle\Controller;

use Pimcore\Bundle\AdminBundle\Controller\AdminController;
use Pimcore\Model\DataObject\AbstractObject;
use Pimcore\Model\DataObject\Concrete;
use Pimcore\Model\Object;
use Pimcore\Model\Site\Dao;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DefaultController extends AdminController
{

    /**
     * @Route("/admin/youwe_multi_cloner/clone")
     */
    public function cloneAction(Request $request)
    {
        $db = \Pimcore\Db::get();
        $cloneCount = $request->get('cloneCount');
        $objectId = $request->get('objectId');
        $parentPath = $request->get('parentPath');
        $moveOriginal = $request->get('moveOriginal', false);
        $openFolder = $request->get('openFolder', false);
        $keyGeneration = $request->get('keyGeneration', 'counter');
        $recursive = $request->get('recursive', false);
        $user = $this->getUser();

        if(!$cloneCount) throw new \InvalidArgumentException('no clone count specified');
        if(!$objectId) throw new \InvalidArgumentException('no object id specified');
        if(!$parentPath) throw new \InvalidArgumentException('no parent path specified');

        $object = Concrete::getById($objectId);
        $abstractObject = new AbstractObject();

        if(!$object) throw new \Exception('object not found by id ' . $objectId);

        $parentFolder = \Pimcore\Model\DataObject\Service::createFolderByPath($parentPath);

        if(!$parentFolder) throw new \Exception('could not create parent folder');

        if($moveOriginal) {
            $object->setParent($parentFolder);
            $object->save();
        }

        $objectService = new \Pimcore\Model\DataObject\Service($user);
        $createdObjectIds = [];
        if($cloneCount) {
            $cnumber = 2;
            for($c = 0; $c < $cloneCount; $c++) {
                if($recursive) {
                    $new = $objectService->copyRecursive($parentFolder, $object);
                } else {
                    $new = $objectService->copyAsChild($parentFolder, $object);
                }
                // reset the key and save again because stupid pimcore keeps adding _copy_copy_copy...
                $keybase = $object->getKey() . '-';
                $keyfolder = $new->getPath();
                if($keyGeneration == 'counter') {
                    do {
                        $newkey = $keybase . $cnumber++;
                        $data = $db->fetchRow('SELECT o_id FROM objects WHERE o_path = :path AND `o_key` = :key', [
                            'path' => $keyfolder,
                            'key' => $newkey
                        ]);
                    } while (isset($data['o_id']) && $data['o_id']);
                } else {
                    $newkey = $keybase . uniqid();
                }
                $new->setKey($newkey);
                $new->save();
                $createdObjectIds[] = $new->getId();
            }
        }

        return $this->json([
            'success' => true,
            'createdObjectIds' => $createdObjectIds,
            'cloneCount' => $cloneCount,
            'parentPath' => $parentPath,
            'parentFolderId' => $parentFolder->getId(),
            'moveOriginal' => $moveOriginal,
            'openFolder' => $openFolder,
            'objectId' => $objectId
        ]);
    }

}
